export default async (req: any, res: any) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.status(200).send(`
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
    
    📚 Endpoints disponibles:
    • GET /api/info - Información de la API
    • GET /api/health - Estado del servicio
    • POST /api/mailer/send - Enviar email individual
    • POST /api/mailer/send-bulk - Enviar emails masivos
    • POST /api/mailer/verify - Verificar dirección de email
  `);
};
