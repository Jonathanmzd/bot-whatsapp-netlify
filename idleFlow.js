const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");

const idleFlow = addKeyword(EVENTS.ACTION)
.addAnswer("⏳ Cerrando sesión por inactividad...", { capture: false })
.addAction(
    async (ctx, { endFlow }) => {
        console.log(`Cerrando sesión por inactividad para el usuario: ${ctx.from}`);
        return endFlow("El tiempo de respuesta ha expirado.");
    }
);

module.exports = {
    idleFlow
};