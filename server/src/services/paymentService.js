/**
 * 支付服务
 * 支持支付宝、微信支付、银联
 */

const axios = require('axios');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

class PaymentService {
  constructor() {
    // 支付宝配置
    this.alipay = {
      appId: process.env.ALIPAY_APP_ID,
      privateKey: process.env.ALIPAY_PRIVATE_KEY,
      alipayPublicKey: process.env.ALIPAY_PUBLIC_KEY,
      gateway: 'https://openapi.alipay.com/gateway.do',
      sandbox: process.env.NODE_ENV !== 'production'
    };

    // 微信支付配置
    this.wechat = {
      appId: process.env.WECHAT_APP_ID,
      mchId: process.env.WECHAT_MCH_ID,
      apiKey: process.env.WECHAT_API_KEY,
      privateKey: fs.readFileSync(process.env.WECHAT_PRIVATE_KEY_PATH),
      gateway: 'https://api.mch.weixin.qq.com'
    };
  }

  /**
   * 创建支付宝订单
   */
  async createAlipayOrder(order) {
    const params = {
      app_id: this.alipay.appId,
      method: 'alipay.trade.page.pay',
      format: 'JSON',
      return_url: `${process.env.FRONTEND_URL}/payment/return`,
      notify_url: `${process.env.API_URL}/payments/alipay/notify`,
      charset: 'utf-8',
      sign_type: 'RSA2',
      timestamp: new Date().toISOString().replace('Z', '+08:00'),
      version: '1.0',
      biz_content: JSON.stringify({
        out_trade_no: order.orderNo,
        total_amount: order.amount.toFixed(2),
        subject: order.subject,
        product_code: 'FAST_INSTANT_TRADE_PAY',
        timeout_express: '30m'
      })
    };

    const sign = this.generateAlipaySign(params);
    params.sign = sign;

    const url = `${this.alipay.gateway}?${new URLSearchParams(params)}`;
    
    return {
      success: true,
      paymentUrl: url,
      paymentMethod: 'alipay'
    };
  }

  /**
   * 创建微信支付订单
   */
  async createWechatOrder(order) {
    const nonceStr = Math.random().toString(36).substring(2, 15);
    const timeStamp = Math.floor(Date.now() / 1000).toString();

    const params = {
      appid: this.wechat.appId,
      mch_id: this.wechat.mchId,
      nonce_str: nonceStr,
      body: order.subject,
      out_trade_no: order.orderNo,
      total_fee: Math.round(order.amount * 100), // 单位：分
      spbill_create_ip: order.ip,
      notify_url: `${process.env.API_URL}/payments/wechat/notify`,
      trade_type: 'NATIVE' // Native 扫码支付
    };

    params.sign = this.generateWechatSign(params);

    const response = await axios.post(
      `${this.wechat.gateway}/pay/unifiedorder`,
      this.objToXml(params),
      {
        headers: { 'Content-Type': 'application/xml' }
      }
    );

    const result = this.xmlToObj(response.data);

    if (result.return_code === 'SUCCESS' && result.result_code === 'SUCCESS') {
      return {
        success: true,
        paymentMethod: 'wechat',
        codeUrl: result.code_url, // 二维码链接
        prepayId: result.prepay_id
      };
    }

    throw new Error(result.return_msg || '微信支付创建失败');
  }

  /**
   * 创建银联订单
   */
  async createUnionpayOrder(order) {
    // 银联支付实现
    const params = {
      version: '5.1.0',
      encoding: 'UTF-8',
      signMethod: '01',
      txnType: '01',
      txnSubType: '01',
      bizType: '000201',
      accessType: '0',
      merId: process.env.UNIONPAY_MER_ID,
      orderId: order.orderNo,
      txnTime: this.formatUnionpayTime(new Date()),
      txnAmt: Math.round(order.amount * 100), // 单位：分
      currencyCode: '156',
      backUrl: `${process.env.API_URL}/payments/unionpay/notify`,
      frontUrl: `${process.env.FRONTEND_URL}/payment/return`
    };

    const sign = this.generateUnionpaySign(params);
    params.signature = sign;

    return {
      success: true,
      paymentMethod: 'unionpay',
      formAction: 'https://gateway.95516.com/gateway/api/frontTransReq.do',
      params
    };
  }

  /**
   * 验证支付宝回调
   */
  verifyAlipayNotify(params) {
    const sign = params.sign;
    delete params.sign;
    delete params.sign_type;

    const content = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');

    const publicKey = `-----BEGIN PUBLIC KEY-----\n${this.alipay.alipayPublicKey}\n-----END PUBLIC KEY-----`;
    
    const verifier = crypto.createVerify('RSA-SHA256');
    verifier.update(content, 'utf8');
    verifier.end();

    const isValid = verifier.verify(
      publicKey,
      Buffer.from(sign, 'base64')
    );

    return isValid;
  }

  /**
   * 验证微信支付回调
   */
  verifyWechatNotify(xmlData) {
    const result = this.xmlToObj(xmlData);
    
    if (result.return_code !== 'SUCCESS') {
      return false;
    }

    const sign = result.sign;
    delete result.sign;

    const calculatedSign = this.generateWechatSign(result);
    
    return sign === calculatedSign;
  }

  /**
   * 查询订单状态（支付宝）
   */
  async queryAlipayOrder(outTradeNo) {
    const params = {
      app_id: this.alipay.appId,
      method: 'alipay.trade.query',
      format: 'JSON',
      charset: 'utf-8',
      sign_type: 'RSA2',
      timestamp: new Date().toISOString().replace('Z', '+08:00'),
      version: '1.0',
      biz_content: JSON.stringify({
        out_trade_no: outTradeNo
      })
    };

    const sign = this.generateAlipaySign(params);
    params.sign = sign;

    const response = await axios.post(this.alipay.gateway, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    return response.data.alipay_trade_query_response;
  }

  /**
   * 申请退款（支付宝）
   */
  async refundAlipayOrder(outTradeNo, refundAmount, refundReason) {
    const params = {
      app_id: this.alipay.appId,
      method: 'alipay.trade.refund',
      format: 'JSON',
      charset: 'utf-8',
      sign_type: 'RSA2',
      timestamp: new Date().toISOString().replace('Z', '+08:00'),
      version: '1.0',
      biz_content: JSON.stringify({
        out_trade_no: outTradeNo,
        refund_amount: refundAmount.toFixed(2),
        refund_reason: refundReason
      })
    };

    const sign = this.generateAlipaySign(params);
    params.sign = sign;

    const response = await axios.post(this.alipay.gateway, params);
    
    return response.data.alipay_trade_refund_response;
  }

  /**
   * 生成支付宝签名
   */
  generateAlipaySign(params) {
    const content = Object.keys(params)
      .filter(key => key !== 'sign' && key !== 'sign_type')
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');

    const privateKey = `-----BEGIN RSA PRIVATE KEY-----\n${this.alipay.privateKey}\n-----END RSA PRIVATE KEY-----`;
    
    const signer = crypto.createSign('RSA-SHA256');
    signer.update(content, 'utf8');
    signer.end();

    const signature = signer.sign(privateKey);
    
    return signature.toString('base64');
  }

  /**
   * 生成微信支付签名
   */
  generateWechatSign(params) {
    const content = Object.keys(params)
      .filter(key => key !== 'sign')
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&') + `&key=${this.wechat.apiKey}`;

    return crypto
      .createHash('md5')
      .update(content)
      .digest('hex')
      .toUpperCase();
  }

  /**
   * 生成银联签名
   */
  generateUnionpaySign(params) {
    const content = Object.keys(params)
      .filter(key => key !== 'signature')
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');

    const signer = crypto.createSign('RSA-SHA256');
    signer.update(content, 'utf8');
    signer.end();

    const privateKey = fs.readFileSync(process.env.UNIONPAY_PRIVATE_KEY_PATH);
    const signature = signer.sign(privateKey);
    
    return signature.toString('base64');
  }

  /**
   * 对象转 XML
   */
  objToXml(obj) {
    let xml = '<xml>';
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        xml += `<${key}>${obj[key]}</${key}>`;
      }
    }
    xml += '</xml>';
    return xml;
  }

  /**
   * XML 转对象
   */
  xmlToObj(xml) {
    const result = {};
    const regex = /<(\w+)>([^<]*)<\/\1>/g;
    let match;
    
    while ((match = regex.exec(xml)) !== null) {
      result[match[1]] = match[2];
    }
    
    return result;
  }

  /**
   * 格式化银联时间
   */
  formatUnionpayTime(date) {
    return date.toISOString().replace(/[-:T.]/g, '').substring(0, 14);
  }
}

module.exports = new PaymentService();
