import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { orderConfirmationTemplate } from './templates/order-confirmation.template';
import { ownerNotificationTemplate } from './templates/owner-notification.template';
import { welcomeTemplate } from './templates/welcome.template';
import { passwordResetTemplate } from './templates/password-reset.template';
import { shippingUpdateTemplate } from './templates/shipping-update.template';

export interface SendMailOptions {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get('SMTP_HOST'),
      port: this.config.get<number>('SMTP_PORT', 587),
      secure: this.config.get<number>('SMTP_PORT', 587) === 465,
      auth: {
        user: this.config.get('SMTP_USER'),
        pass: this.config.get('SMTP_PASS'),
      },
    });
  }

  async send(options: SendMailOptions): Promise<void> {
    try {
      const from = `"${this.config.get('MAIL_FROM_NAME', 'Electronic Store')}" <${this.config.get('MAIL_FROM_ADDRESS')}>`;
      await this.transporter.sendMail({ from, ...options });
      this.logger.log(`Email sent to ${options.to}: ${options.subject}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}`, error);
      throw error;
    }
  }

  async sendOrderConfirmation(data: OrderEmailData) {
    await this.send({
      to: data.customerEmail,
      subject: `Order Confirmed — ${data.orderNumber}`,
      html: orderConfirmationTemplate(data),
    });
  }

  async sendOwnerOrderNotification(data: OrderEmailData) {
    const ownerEmail = this.config.get('STORE_OWNER_EMAIL');
    if (!ownerEmail) return;
    await this.send({
      to: ownerEmail,
      subject: `New Order — ${data.orderNumber} — $${data.total.toFixed(2)}`,
      html: ownerNotificationTemplate(data),
    });
  }

  async sendWelcomeEmail(data: { email: string; firstName: string }) {
    await this.send({
      to: data.email,
      subject: 'Welcome to Electronic Store',
      html: welcomeTemplate(data),
    });
  }

  async sendPasswordReset(data: { email: string; firstName: string; resetUrl: string; expiresIn: string }) {
    await this.send({
      to: data.email,
      subject: 'Reset Your Password',
      html: passwordResetTemplate(data),
    });
  }

  async sendShippingUpdate(data: { email: string; firstName: string; orderNumber: string; status: string; trackingNumber?: string; trackingUrl?: string }) {
    await this.send({
      to: data.email,
      subject: `Shipping Update — Order ${data.orderNumber}`,
      html: shippingUpdateTemplate(data),
    });
  }
}

export interface OrderItemData {
  name: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  total: number;
  image?: string;
  variant?: string;
}

export interface OrderEmailData {
  orderNumber: string;
  orderDate: string;
  customerEmail: string;
  customerName: string;
  items: OrderItemData[];
  subtotal: number;
  discountAmount: number;
  shippingCost: number;
  taxAmount: number;
  total: number;
  paymentMethod: string;
  couponCode?: string;
  shippingAddress: {
    firstName: string; lastName: string; addressLine1: string;
    addressLine2?: string; city: string; state: string;
    postalCode: string; country: string; phone?: string;
  };
  billingAddress?: {
    firstName: string; lastName: string; addressLine1: string;
    addressLine2?: string; city: string; state: string;
    postalCode: string; country: string;
  };
  trackingNumber?: string;
  storeName: string;
  storeLogo?: string;
  storeUrl: string;
}
