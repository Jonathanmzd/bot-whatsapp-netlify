const { EVENTS, addKeyword } = require('@bot-whatsapp/bot');

// Objeto para almacenar los temporizadores para cada usuario
const timers = {};

const start = (ctx, gotoFlow, ms) => {
    stop(ctx); // Detener cualquier temporizador existente antes de iniciar uno nuevo
    console.log(`Iniciando temporizador para el usuario: ${ctx.from}`);

    timers[ctx.from] = setTimeout(async () => {
        console.log(`Tiempo de inactividad alcanzado para el usuario: ${ctx.from}`);
        try {
            console.log("Intentando redirigir al flujo de inactividad...");
            stop(ctx);
                    const { idleFlow } = require('../idleFlow'); // 🔥 Importación dentro del setTimeout
        await gotoFlow(idleFlow);
            console.log("Se ejecutó gotoFlow correctamente.");
        } catch (error) {
            console.error("Error al redirigir al flujo de inactividad:", error);
        }
    }, ms);
};
const reset = (ctx, gotoFlow, ms) => {
    stop(ctx);
    console.log(`Reiniciando temporizador para el usuario: ${ctx.from}`);
    start(ctx, gotoFlow, ms);
};

const stop = (ctx) => {
    if (timers[ctx.from]) {
        clearTimeout(timers[ctx.from]);
        delete timers[ctx.from];
    }
};

module.exports =  {
    start,
    reset,
    stop // Importar correctamente para evitar dependencias circulares
};