const { createBot, createProvider, createFlow, addKeyword } = require('@bot-whatsapp/bot');
const QRPortalWeb = require('@bot-whatsapp/portal');
const BaileysProvider = require('@bot-whatsapp/provider/baileys');
// const MockAdapter = require('@bot-whatsapp/database/mock');
const MySQLAdapter = require('@bot-whatsapp/database/mysql')
const axios = require('axios');
// Estructura para almacenar datos del usuario
const { EVENTS } = require('@bot-whatsapp/bot');
const { updateMessageWithPollUpdate, delay, captureEventStream } = require('@whiskeysockets/baileys');
const json = require('@bot-whatsapp/database/json');
const { start, stop, reset } = require('./idle-custom');

/**
 * Declaramos las conexiones de MySQL
 */
const MYSQL_DB_HOST = '192.168.45.129'
const MYSQL_DB_USER = 'gateway'
const MYSQL_DB_PASSWORD = '7layer'
const MYSQL_DB_NAME = 'bot'
const MYSQL_DB_PORT = '3306'


const MAX_SUBJECT_LENGTH = 50; // Número máximo de caracteres para el asunto

// Función para normalizar y convertir a minúsculas 
function normalizeString(str) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
};

// Función para extraer valores usando una expresión regular
function extractValues(regex, str) {
    let values = [];
    let match;
    while ((match = regex.exec(str)) !== null) {
        values.push(match[1]);
    }
    return values;
};

function decodeHtmlEntities(text) {
    const entities = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#39;': "'",
        '&#xF3;': 'ó',
        '&#xE9;': 'é',
	    '&#xED;': 'í',
        '&#xE1;': 'á'
        // Puedes agregar más entidades según sea necesario
    };

    return text.replace(/&[a-zA-Z0-9#x]+;/g, (match) => {
        return entities[match] || match;
    });
};

// Función para normalizar caracteres especiales
function normalizeString(text) {
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
};

const flowName = "general_flow";
const stepName = "general_flow";

const flowInicio = addKeyword([])
    .addAction(async (ctx, { gotoFlow }) => start(ctx, gotoFlow, 50000))

    .addAnswer('Bienvenido al chat de preguntas frecuentes de Superintendencia de Notariado y Registro. Mi nombre es Vicky, su asistente virtual que atenderá su consulta. Antes de continuar, por favor ingrese su nombre:')

    .addAction({ capture: true }, async (ctx, {endFlow, gotoFlow,state }) => {
        reset(ctx, gotoFlow, 50000);
        const text = ctx.body.trim().toLowerCase();
        // Normalización de comandos para salir
        if (['salir', 'Salir', 'SALIR', 'quit', 'QUIT', '0'].includes(text)) {
            stop(ctx);
            return endFlow('Para la Oficina de Atención al Ciudadano de la Superintendencia de Notariado y Registro ha sido un gusto atenderle.');
        }else{
            // Capitalizar la primera letra del nombre
            const nombreCapitalizado = text.charAt(0).toUpperCase() + text.slice(1);
            await state.update({ nombreUser: nombreCapitalizado });
            stop(ctx);
            return gotoFlow(flowCorreo);
        };
    });

    const flowCorreo = addKeyword(EVENTS.ACTION)
    .addAnswer('Ahora por favor escriba su correo')
    .addAction({ capture: true }, async (ctx, { state, endFlow, gotoFlow,flowDynamic }) => {
        reset(ctx, gotoFlow, 50000);
        const text = ctx.body.trim().toLowerCase();
        console.log("Correo recibido:", text); // Verificar que el correo se captura correctamente   
        // Normalización de comandos para salir
        if (['salir', 'Salir', 'SALIR', 'quit', 'QUIT', '0'].includes(text)) {
            console.log('nooo');
            stop(ctx);
            return endFlow('Para la Oficina de Atención al Ciudadano de la Superintendencia de Notariado y Registro ha sido un gusto atenderle.');
        }else{

            // Expresión regular para validar el correo electrónico
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(text)) {
                stop(ctx);
                await flowDynamic('El formato del correo electrónico no es válido. Por favor, ingresa un correo válido.');
                return gotoFlow(flowCorreo);
            };
            console.log('correo actualizado');
            await state.update({correoUser: text});
            return gotoFlow(flowInicio1);
        };
    });

    const flowInicio1 = addKeyword(EVENTS.ACTION)
    .addAction(async (ctx, { flowDynamic, state, gotoFlow }) => {
        reset(ctx, gotoFlow, 50000);
        const nombreUsuario = state.get('nombreUser');
        const reqData = { FlowName: flowName, StepName: stepName };
        console.log('crear request');
        console.log(reqData);
        try {
            const response = await axios.post('http://192.168.45.129:8080/WPDataBase', reqData);
            const lista = response.data.rta.split(/\s*~,\s*/);
            const steps = response.data.step.split(/\s*,\s*/);
            const flows = response.data.flow.split(/\s*,\s*/);

            console.log("Lista:", lista);
            console.log("Steps:", steps);
            console.log("Flows:", flows);

            // Almacenar las opciones junto con los steps y flows en el estado
            await state.update({
                opciones: lista,
                steps: steps,
                flows: flows,
            });

            // Construye un mensaje con las opciones numeradas
            const mensajeOpciones = lista.map((opcion, index) => `${index + 1}. ${opcion}`).join('\n');

            // Envía la lista de opciones
            await flowDynamic(`${nombreUsuario}, por favor selecciona una opción:\n${mensajeOpciones}`);
        } catch (error) {
            if (error.response) {
                console.error('Error en la respuesta del servidor:', error.response.data);
                console.error('Código de estado:', error.response.status);
                console.error('Encabezados:', error.response.headers);
            } else if (error.request) {
                console.error('No hubo respuesta del servidor:', error.request);
            } else {
                console.error('Error al configurar la solicitud:', error.message);
            }
            console.error('Configuración de Axios:', error.config);

            // Envía un mensaje de error al usuario
            await flowDynamic('Hubo un error en la consulta. Por favor, inténtalo de nuevo.');

            // Reinicia el flujo
            stop(ctx);
            return gotoFlow(flowInicio1);
        }
    })
    .addAction({ capture: true }, async (ctx, { state, endFlow, gotoFlow, flowDynamic }) => {
        reset(ctx, gotoFlow, 50000);

        // Normalización de comandos para salir
        if (['salir', 'Salir', 'SALIR', 'quit', 'QUIT', '0'].includes(ctx.body.trim().toLowerCase())) {
            stop(ctx);
            return endFlow('Para la Oficina de Atención al Ciudadano de la Superintendencia de Notariado y Registro ha sido un gusto atenderle.');
        }

        // Procesar la opción seleccionada
        const option = parseInt(ctx.body);
        const opciones = state.get('opciones');
        const steps = state.get('steps');
        const flows = state.get('flows');

        if (isNaN(option) || option < 1 || option > opciones.length) {
            stop(ctx);
            await flowDynamic('Por favor, selecciona una opción válida.');
            return gotoFlow(flowInicio1); // Reintentar desde el inicio
        }

        // Obtener los valores correspondientes a la opción seleccionada
        const stepNameSeleccionado = steps[option - 1];
        const flowNameSeleccionado = flows[option - 1];

        console.log(`Step seleccionado: ${stepNameSeleccionado}`);
        console.log(`Flow seleccionado: ${flowNameSeleccionado}`);

        // Almacenar los valores seleccionados para el siguiente flujo
        await state.update({
            stepNameSeleccionado,
            flowNameSeleccionado,
        });
        return gotoFlow(flow1); // Cambia al siguiente flujo
    });

    const flow1 = addKeyword(EVENTS.ACTION)
    .addAction(async(ctx, {state,flowDynamic,gotoFlow} ) =>{
                 reset(ctx,gotoFlow,50000);
                 const nombreUsuario = state.get('nombreUser');
                 const stepName = state.get('stepNameSeleccionado');
                 const flowName = state.get('flowNameSeleccionado');
                 if (!stepName || !flowName) {
                    stop(ctx);
                    await flowDynamic('Ocurrió un error. Por favor, reinicia el flujo.');
                    return gotoFlow(flowInicio1); // Reintenta desde el inicio
                }
        
                // Condición 1: Si stepName es "welcome_flow"
                if (stepName === "welcome_flow") {
                    stop(ctx);
                    await flowDynamic('Regresando al flujo anterior...');
                    return gotoFlow(flowInicio1);
                }
                // Condición 2: Si stepName contiene "answer_flow"
                if (stepName.includes("answer_flow")) {
                    try {
                        const reqData = { StepName: stepName, FlowName: flowName };
                        const response = await axios.post('http://192.168.45.129:8080/WPDataBase', reqData);

                        // Obtener la respuesta asociada
                        const respuesta = response.data.rta;
                        await flowDynamic(`${respuesta} \n\n ${nombreUsuario}, ¿Desea continuar con otra selección? (sí/no)`);
                        return gotoFlow(flow2);
                    
                    } catch (error) {
                        console.error('Error en la consulta:', error.message);
                        await flowDynamic('Hubo un error al obtener la respuesta. Por favor, intenta de nuevo.');
                        stop(ctx);
                        return gotoFlow(flowInicio1);
                    }
                }

                        // Condición 3: Default
                try {
                    console.log('opción actual= StepName:' + stepName + ' FlowName: '+ flowName);
                    const reqData = { StepName: stepName, FlowName: flowName };
                    const response = await axios.post('http://192.168.45.129:8080/WPDataBase', reqData);

                    // Procesar opciones
                    const lista = response.data.rta.split(/\s*~,\s*/);
                    const steps = response.data.step.split(/\s*,\s*/);
                    const flows = response.data.flow.split(/\s*,\s*/);

                    // Actualizar estado con las nuevas opciones
                    await state.update({
                        opciones: lista,
                        steps: steps,
                        flows: flows,
                    });
                    // Mostrar opciones al usuario
                    const mensajeOpciones = lista.map((opcion, index) => `${index + 1}. ${opcion}`).join('\n');
                    await flowDynamic(`${nombreUsuario}, por favor selecciona una opción:\n${mensajeOpciones}`);
                    return gotoFlow(flow2);
                } catch (error) {
                    stop(ctx);
                    console.error('Error al obtener las opciones:', error.message);
                    await flowDynamic('Hubo un error al obtener las opciones. Por favor, intenta de nuevo.');
                    return gotoFlow(flowInicio1);
                }
    })

    
    const flow2 = addKeyword(EVENTS.ACTION)
    .addAction({ capture: true }, async(ctx, { state, endFlow, gotoFlow, flowDynamic }) => {
        reset(ctx,gotoFlow,50000);
        const respuesta = ctx.body.trim().toLowerCase();
        const flow = state.get('flowNameSeleccionado');

        // Verificar respuesta "sí" o "no" en la Condición 2
        if (respuesta === "sí" || respuesta === "si") {
            stop(ctx);
            console.log('stepName1:'+ state.get('stepNameSeleccionado'));
            console.log('flowName1:'+ state.get('flowNameSeleccionado'));
            await state.update({stepNameSeleccionado: flow});
            return gotoFlow(flow1);
        } else if (respuesta === "no") {
            stop(ctx);
            return endFlow('Para la Oficina de Atención al Ciudadano de la Superintendencia de Notariado y Registro ha sido un gusto atenderle.');
        } else {
            // Si no es "sí" ni "no", procesar opción como número
            const option = parseInt(ctx.body);
            const opciones = state.get('opciones');
            const steps = state.get('steps');
            const flows = state.get('flows');

            if (isNaN(option) || option < 1 || option > opciones.length) {
                stop(ctx);
                await flowDynamic('Por favor, selecciona una opción válida.');
                return gotoFlow(flow2);  
            }

            // Actualizar estado para el siguiente flujo
            const stepNameSeleccionado = steps[option - 1];
            const flowNameSeleccionado = flows[option - 1];
            await state.update({
                stepNameSeleccionado,
                flowNameSeleccionado,
            });
            stop(ctx);
            return gotoFlow(flow1); // Volver al flujo con los valores seleccionados
        }git
    });
        



const main = async () => {
    // const adapterDB = new MockAdapter();
    // const adapterFlow = createFlow([flowInicio, flowCorreo, flowInicio1,flow1,flow2]);
    // const adapterProvider = createProvider(BaileysProvider);

    // createBot({
    //    flow: adapterFlow,
    //    provider: adapterProvider,
    //    database: adapterDB,
    // });

    // QRPortalWeb();

    const adapterDB = new MySQLAdapter({
        host: MYSQL_DB_HOST,
        user: MYSQL_DB_USER,
        database: MYSQL_DB_NAME,
        password: MYSQL_DB_PASSWORD,
        port: MYSQL_DB_PORT,
    })
    const adapterFlow = createFlow([flowInicio, flowCorreo, flowInicio1,flow1,flow2])
    const adapterProvider = createProvider(BaileysProvider)
    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })
    QRPortalWeb()
};

main();