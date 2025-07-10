import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getApiInfo(): any {
    return {
      name: '📧 Email Verifier API',
      version: '1.0.0',
      description: 'Servicio profesional de verificación y envío de emails',
      status: '✅ Online',
      timestamp: new Date().toISOString(),
      endpoints: {
        health: {
          path: '/health',
          method: 'GET',
          description: '🏥 Verificar el estado de salud del servicio'
        },
        mailer: {
          send: {
            path: '/mailer/send',
            method: 'POST',
            description: '📤 Enviar email individual'
          },
          sendBulk: {
            path: '/mailer/send-bulk',
            method: 'POST',
            description: '📬 Enviar emails masivos'
          },
          verify: {
            path: '/mailer/verify',
            method: 'POST',
            description: '✉️ Verificar dirección de email'
          }
        }
      },
      features: [
        '🔐 Autenticación y rate limiting',
        '📊 Logging y monitoreo',
        '🛡️ Middleware de seguridad',
        '⚡ Alto rendimiento',
        '📈 Escalabilidad'
      ],
      documentation: {
        swagger: '/api/docs',
        postman: 'Available on request'
      },
      contact: {
        developer: 'Email Verifier Team',
        support: 'support@emailverifier.com'
      }
    };
  }

  getWelcomeMessage(): string {
    return `
    🎉 ¡Bienvenido a Email Verifier API! 🎉
    
    ═══════════════════════════════════════
    📧 Tu solución completa para emails 📧
    ═══════════════════════════════════════
    
    ✨ Características principales:
    • Verificación de emails en tiempo real
    • Envío de emails individuales y masivos
    • Rate limiting y seguridad avanzada
    • Monitoreo y logging completo
    
    🚀 ¡Comienza a usar la API ahora mismo!
    `;
  }
}