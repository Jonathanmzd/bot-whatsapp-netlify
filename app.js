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
        

// const flowInicio = addKeyword([])
//     .addAction(async (ctx, { gotoFlow }) => start(ctx, gotoFlow, 10000))
//     .addAnswer(['Hola, soy Lucy!','Para empezar, por favor ingresa tu número de identificación'],
//         { capture: true},
//         async (ctx, { gotoFlow, state }) => {
//             reset(ctx, gotoFlow, 10000);
//             await state.update({userID: ctx.body});
//         }
//     )
//     .addAction( async(ctx, { state, endFlow, flowDynamic, gotoFlow }) => {
//         const userID = state.get('userID'); // Obtener el usuario del estado
//         if (['salir', 'Salir', 'SALIR', 'quit', 'QUIT', '0'].includes(userID)) {
//             stop(ctx);
//             return endFlow('Terminando solicitud. Gracias por utilizar nuestros servicios!');
//         } else {
//             const reqData = { UserID: userID };
//             console.log(reqData);

//             // Enviar los datos a la API Gateway
//             try {
//                 const response = await axios.post('http://192.168.45.129:8080/WPUser', reqData);
//                 const listaG = response.data;
//                 console.log(listaG);
//                 await state.update({ ListaPrin: listaG });
//                 const listaJSON = JSON.parse(JSON.stringify(listaG));
//                 const zcliente = listaJSON.zcliente;
//                 if (zcliente === '1' || zcliente === '400065') {
//                     reset(ctx,gotoFlow,10000);
//                     return gotoFlow(flowAnalista);
//                 } else {
//                     stop(ctx);
//                     return endFlow('Terminando solicitud. Gracias por utilizar nuestros servicios!');
//                 }
//             } catch (error) {
//                 if (error.response) {
//                     console.error('Error en la respuesta del servidor:', error.response.data);
//                     console.error('Código de estado:', error.response.status);
//                     console.error('Encabezados:', error.response.headers);
//                 } else if (error.request) {
//                     console.error('No hubo respuesta del servidor:', error.request);
//                 } else {
//                     console.error('Error al configurar la solicitud:', error.message);
//                 }
//                 await flowDynamic('El usuario ingresado es incorrecto. Por favor, intenta de nuevo.');
//                 reset(ctx,gotoFlow,10000);
//                 return gotoFlow(flowInicio);
//             }
//         }
//     });

// const flowAnalista = addKeyword( EVENTS.ACTION)
//     .addAction(async(ctx, {state,flowDynamic,gotoFlow} ) =>{
//         reset(ctx,gotoFlow,10000);
//         const lista = JSON.stringify(state.get('ListaPrin'));
//         const listaG = JSON.parse(lista);
//         const nombre = listaG.first_name;
//         await flowDynamic('Bienvenido, analista '+ nombre + ' . ¿Qué te gustaría hacer? \n1. Consultar los detalles de uno de mis casos \n2. Agregar un comentario a uno de mis casos \n3. Cambiar el estado de uno de mis casos');
//     })
//     .addAction({capture:true}, 
//         async(ctx, {state,flowDynamic,endFlow,fallBack,gotoFlow})=>{
//             reset(ctx, gotoFlow, 10000);
//             if(['salir','Salir','SALIR','quit','QUIT','0'].includes(normalizeString(ctx.body))){
//                 stop(ctx);
//                 return endFlow('Terminando solicitud. Gracias por utilizar nuestros servicios!');
//             }
//             else{        
//                 if(parseInt(ctx.body) == 1){
//                     await state.update({option: parseInt(ctx.body)});
//                     await flowDynamic('De acuerdo');
//                     return gotoFlow(flowConsultarCasosAnalista);
//                 }
//                 else if (parseInt(ctx.body) == 2) {
//                     await state.update({option: parseInt(ctx.body)});
//                     await flowDynamic('De acuerdo');
//                    return gotoFlow(flowConsultarCasosAnalista);
//                 }
//                 else if (parseInt(ctx.body) == 3) {
//                     await state.update({option: parseInt(ctx.body)});
//                     await flowDynamic('De acuerdo');
//                     return gotoFlow(flowConsultarCasosAnalista);
//                 } 
//                 else{
//                     return fallBack('Opción no válida. Por favor, intenta de nuevo.');
//                 };
//             }

//     });

//     const flowConsultarCasosAnalista = addKeyword(EVENTS.ACTION)
//         .addAction(async(_, {state,flowDynamic,gotoFlow}) =>{
//             let itemsConsulta = [];
//             const UserID = state.get('userID');
//             console.log(UserID);
//             const reqData = {
//                 UserID: UserID
//             };
//             try {
//                 const response = await axios.post('http://192.168.45.129:8080/WPConsulta', reqData);
//                 console.log('Datos enviados correctamente:', response.data);
//                 const listaCasos = response.data;
//                 // Convertir entidades HTML a caracteres normales
//                 listaConsulta = listaCasos.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
//                 console.log('lista:' + listaConsulta);

//                 // Expresiones regulares para extraer los valores de 'id' y 'sym'
//                 let refNumRegex = /<AttrName>ref_num<\/AttrName>\s*<AttrValue>(.*?)<\/AttrValue>/g;
//                 let refNum = extractValues(refNumRegex, listaConsulta);
//                 console.log('ref:' + refNum);
//                          // Crear una lista con los valores
//                 for (let i = 0; i < refNum.length; i++) {
//                     itemsConsulta.push({
//                         item: i + 1,
//                         id: refNum[i]
//                     });
//                  };
//                 console.log('estado:'+ JSON.stringify(itemsConsulta));
//                 await state.update({itemsConsulta: itemsConsulta});
//                 console.log(state.get('itemsConsulta'));
//                 if(itemsConsulta != ''){
//                     return gotoFlow(opcionesCasoScene);
//                 }
//                 else{
//                     await flowDynamic('No se encontraron casos relacionados a la cuenta. Terminando la solicitud...');
//                     return gotoFlow(flowAnalista);
//                 };        
//             } catch (error) {
//                 if (error.response) {
//                     // El servidor respondió con un código de estado fuera del rango 2xx
//                     console.error('Error en la respuesta del servidor:', error.response.data);
//                     console.error('Código de estado:', error.response.status);
//                     console.error('Encabezados:', error.response.headers);
                    
//                 } else if (error.request) {
//                     // La solicitud fue hecha pero no hubo respuesta
//                     console.error('No hubo respuesta del servidor:', error.request);
                    
//                 } else {
//                     // Algo sucedió al configurar la solicitud
//                     console.error('Error al configurar la solicitud:', error.message);
//                 }
//                 console.error('Configuración de Axios:', error.config);
//                 await flowDynamic('Hubo un error en la consulta. Por favor, inténtalo de nuevo.');
//                 stop(ctx);
//                 return gotoFlow(flowAnalista);
//             }
//         });

//         const opcionesCasoScene = addKeyword(EVENTS.ACTION)
//         .addAction(async(_, {state,flowDynamic}) =>{
//             let rtaCasosUser = state.get('itemsConsulta');
//             const listaG = JSON.stringify(state.get('ListaPrin'));
//             const lista = JSON.parse(listaG);
//             let nombre = lista.first_name;
//             let message = '';
//             let option = state.get('option');
//             console.log('option:'+option);
//             for(let i=0; i < rtaCasosUser.length; i++) {
//                 message += rtaCasosUser[i].item + '. ' + rtaCasosUser[i].id + '\n';
//             };
//             if(option=== 1){
//                 await flowDynamic(nombre+ ', estos son los casos activos actualmente: \n' + message + '\n Escribe el número del ítem del caso el cual desea saber más detalles.');
//             }
//             else if(option=== 2){
//                 await flowDynamic(nombre+ ', estos son los casos activos actualmente: \n' + message + '\n Escribe el número del ítem del caso el cual desea agregar un comentario.');
//             }
//             else if(option=== 3){
//                 await flowDynamic(nombre+ ', estos son los casos activos actualmente: \n' + message + '\n Escribe el número del ítem del caso el cual desea cambiar el estado.');
//             }

//         })
//         .addAction({capture:true}, async(ctx, {state,gotoFlow,fallBack,endFlow}) =>{
//             reset(ctx,gotoFlow,10000);
//             if(['salir','Salir','SALIR','quit','QUIT','0'].includes(normalizeString(ctx.body))){
//                 stop(ctx);
//                 return endFlow('Terminando solicitud. Gracias por utilizar nuestros servicios!');
//             }
//             else{
//                 let eleccion = parseInt(ctx.body);
//                 let encontrado = false;
//                 let lista = state.get('itemsConsulta');
//                 for (let i = 0; i < lista.length; i++){
//                     if(lista[i].item == eleccion ){ 
//                         encontrado = true;
//                         let caso = lista[i].id;
//                         await state.update({caso: caso});
//                         return gotoFlow(detalleCasoAnalistaScene);
//                     };
//                 };
//                 if(!encontrado){
//                     return fallBack('Opción no válida. Por favor, intenta de nuevo.');
//                 };
//             };

//         });

// const detalleCasoAnalistaScene = addKeyword(EVENTS.ACTION)
//         .addAction(async(_, {state,flowDynamic,gotoFlow}) =>{
//             let ref_num = state.get('caso');
//             const reqData = {
//                 ref_num: ref_num
//             };
//             try {
//                 const response = await axios.post('http://192.168.45.129:8080/WPConsultaDetalle', reqData);
//                 console.log('Datos enviados correctamente:', response.data);
//                 await state.update({contenido: response.data});
//                 const option = state.get('option');
//                 if(option===1){
//                     return gotoFlow(postDetalleAnalistaScene);
//                 }
//                 else if(option===2){
//                     return gotoFlow(agregarComentarioAnalistaScene);
//                 }
//                 else if(option===3){
//                     return gotoFlow(listaEstadoAnalistaScene);
//                 };
//             } catch (error) {
//                 if (error.response) {
//                     // El servidor respondió con un código de estado fuera del rango 2xx
//                     console.error('Error en la respuesta del servidor:', error.response.data);
//                     console.error('Código de estado:', error.response.status);
//                     console.error('Encabezados:', error.response.headers);
                    
//                 } else if (error.request) {
//                     // La solicitud fue hecha pero no hubo respuesta
//                     console.error('No hubo respuesta del servidor:', error.request);
                    
//                 } else {
//                     // Algo sucedió al configurar la solicitud
//                     console.error('Error al configurar la solicitud:', error.message);
//                 }
//                 console.error('Configuración de Axios:', error.config);
//                 await flowDynamic('Hubo un error en la consulta. Por favor, inténtalo de nuevo.');
//                 return gotoFlow(flowAnalista);
//             }

//         });

//         const postDetalleAnalistaScene = addKeyword(EVENTS.ACTION)
//         .addAction(async(_,{state,flowDynamic}) =>{
//             const listaG = JSON.stringify(state.get('ListaPrin'));
//             const lista = JSON.parse(listaG);
//             let nombre = lista.first_name;
//             const contenido = state.get('contenido');
//             let message= ' Numero de referencia: ' + contenido.ref_num + '\n Descripción: ' + contenido.summary + '\n Estado: '+ contenido.status + '\n Solución: '+ contenido.cat;
//             await flowDynamic(nombre + ', estos son los detalles del caso seleccionado: \n \n'+ message + '\n \n¿Desea realizar alguna otra solicitud? (Sí/No)');
//         })
//         .addAction({capture:true}, async(ctx, {flowDynamic,gotoFlow,endFlow,fallBack}) =>{
//             reset(ctx, gotoFlow, 10000);
//             if(['salir','Salir','SALIR','quit','QUIT','0'].includes(normalizeString(ctx.body))){
//                 stop(ctx);
//                 return endFlow('Terminando solicitud. Gracias por utilizar nuestros servicios!');
//             }
//             else{
//                 let bool = ctx.body;
//                 if(['sí','Si','si','Sí','SI','SÍ','Yes','yes'].includes(normalizeString(bool))){
//                     await flowDynamic('Volviendo al menú inicial.');
//                     return gotoFlow(flowAnalista);
//                 }
//                 else if (['No','no','NO'].includes(normalizeString(bool))) {
//                     stop(ctx);
//                     return endFlow('Terminando solicitud. Gracias por utilizar nuestros servicios!');
//                 } else {
//                     stop(ctx);
//                     return fallBack('Por favor, ingresa una opción válida');
//                 };
//             }
//         });

//         const agregarComentarioAnalistaScene = addKeyword(EVENTS.ACTION)
//         .addAction(async(_, {flowDynamic})=>{
//             await flowDynamic('¿Cuál es el comentario a agregar?');
//         })
//         .addAction({capture:true}, async(ctx, {state,flowDynamic,gotoFlow,endFlow}) =>{
//             reset(ctx, gotoFlow, 10000);
//             if(['salir','Salir','SALIR','quit','QUIT','0'].includes(normalizeString(ctx.body))){
//                 stop(ctx);
//                 return endFlow('Terminando solicitud. Gracias por utilizar nuestros servicios!');
//             }
//             else{
//                 await state.update({comentario: normalizeString(ctx.body)});
//                 await flowDynamic('Procesando solicitud..');
//                 stop(ctx);
//                 return gotoFlow(comentandoScene);
//             };
//         });

//         const comentandoScene = addKeyword(EVENTS.ACTION)
//         .addAction(async(_, {state,flowDynamic,gotoFlow}) =>{
//             const contenido = state.get('contenido');
//             const reqData = {
//                 cr: contenido.cr,
//                 comentario: state.get('comentario')
//             };
//             try {
//                 const response = await axios.post('http://192.168.45.129:8080/WPAgregarComentario', reqData);
//                 console.log('Datos enviados correctamente:', response.data);
//                 await state.update({contenidoComentario: response.data});
//                 return gotoFlow(postComentarioAnalistaScene);

//             } catch (error) {
//                 if (error.response) {
//                     // El servidor respondió con un código de estado fuera del rango 2xx
//                     console.error('Error en la respuesta del servidor:', error.response.data);
//                     console.error('Código de estado:', error.response.status);
//                     console.error('Encabezados:', error.response.headers);
                    
//                 } else if (error.request) {
//                     // La solicitud fue hecha pero no hubo respuesta
//                     console.error('No hubo respuesta del servidor:', error.request);
                    
//                 } else {
//                     // Algo sucedió al configurar la solicitud
//                     console.error('Error al configurar la solicitud:', error.message);
//                 }
//                 console.error('Configuración de Axios:', error.config);
//                 await flowDynamic('Hubo un error en la consulta. Por favor, inténtalo de nuevo.');
//                 return gotoFlow(flowAnalista);
//             }
//         });

//         const postComentarioAnalistaScene = addKeyword(EVENTS.ACTION)
//         .addAction(async(_, {state,flowDynamic}) =>{
//             const listaG = JSON.stringify(state.get('ListaPrin'));
//             const lista = JSON.parse(listaG);
//             let nombre = lista.first_name;
//             const contenido = state.get('contenido');
//             let ref = contenido.ref_num;
//             await  flowDynamic(nombre + ', su comentario para el caso '+ ref+' fue exitosamente registrado! \n \n¿Desea realizar alguna otra solicitud? (Sí/No)');           
//         })
//         .addAction({capture:true}, async(ctx, {flowDynamic,gotoFlow,fallBack,endFlow}) =>{
//             reset(ctx, gotoFlow, 10000);
//             if(['salir','Salir','SALIR','quit','QUIT','0'].includes(normalizeString(ctx.body))){
//                 stop(ctx);
//                 return endFlow('Terminando solicitud. Gracias por utilizar nuestros servicios!');
//             }
//             else{
//                 let bool = ctx.body;
//                 if(['sí','Si','si','Sí','SI','SÍ','Yes','yes'].includes(normalizeString(bool))){
//                     await flowDynamic('Volviendo al menú inicial.');
//                     stop(ctx);
//                     return gotoFlow(flowAnalista);
//                 }
//                 else if (['No','no','NO'].includes(normalizeString(bool))) {
//                     stop(ctx);
//                     return endFlow('Terminando solicitud. Gracias por utilizar nuestros servicios!');
//                 } else {
//                     stop(ctx);
//                     return fallBack('Por favor, ingresa una opción válida');
//                 };
//             }
//         });

//         const listaEstadoAnalistaScene = addKeyword(EVENTS.ACTION)
//         .addAction(async(_, {state,flowDynamic,gotoFlow})=>{
//             let itemsEstados = [];
//             try {
//                 const response = await axios.post('http://192.168.45.129:8080/WPEstados');
//                 console.log('Datos enviados correctamente:', response.data);
//                 const listaG = response.data;
//                 // Convertir entidades HTML a caracteres normales
//                 let listaConsulta = decodeHtmlEntities(listaG.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"'));
//                 console.log('lista:' + listaConsulta);
        
//                 // Expresiones regulares para extraer los valores de 'sym'
//                 let symRegex = /<AttrName>sym<\/AttrName>\s*<AttrValue>(.*?)<\/AttrValue>/g;
//                 let estados = extractValues(symRegex, listaConsulta);
//                 console.log('estados:' + estados);
        
//                 // Expresión regular para extraer los valores de 'crs'
//                 let crsRegex = /<Handle>(crs:\d+)<\/Handle>/g;
//                 let crsValues = extractValues(crsRegex, listaConsulta);
//                 console.log('crsValues:', crsValues);
        
//                 // Crear una lista con los valores
//                 for (let i = 0; i < estados.length; i++) {
//                     itemsEstados.push({
//                         item: i + 1,
//                         estado: estados[i],
//                         crs: crsValues[i]
//                     });
//                 };
//                 await state.update({itemsEstados: itemsEstados});
//                 if (itemsEstados.length > 0) {
//                     // Responder al usuario con la lista de estados
//                     let replyMessage = 'Escribe el número del ítem del nuevo estado a asignar para el caso seleccionado:\n';
//                     itemsEstados.forEach(item => {
//                         replyMessage += `${item.item}. ${item.estado}\n`;
//                     });
//                     await flowDynamic(replyMessage);
//                 } else {
//                     await flowDynamic('No se encontraron estados. Volviendo al menú.');
//                     return gotoFlow(flowAnalista); // Salir de la escena
//                 }

//             } catch (error) {
//                 if (error.response) {
//                     // El servidor respondió con un código de estado fuera del rango 2xx
//                     console.error('Error en la respuesta del servidor:', error.response.data);
//                     console.error('Código de estado:', error.response.status);
//                     console.error('Encabezados:', error.response.headers);
                    
//                 } else if (error.request) {
//                     // La solicitud fue hecha pero no hubo respuesta
//                     console.error('No hubo respuesta del servidor:', error.request);
                    
//                 } else {
//                     // Algo sucedió al configurar la solicitud
//                     console.error('Error al configurar la solicitud:', error.message);
//                 }
//                 console.error('Configuración de Axios:', error.config);
//                 await flowDynamic('Hubo un error en la consulta. Por favor, inténtalo de nuevo.');
//                 return gotoFlow(flowAnalista);
//             }
//         })
//         .addAction({capture:true}, async(ctx,{state,gotoFlow,fallBack,endFlow})=>{
//             reset(ctx, gotoFlow, 10000);
//             if(['salir','Salir','SALIR','quit','QUIT','0'].includes(normalizeString(ctx.body))){
//                 stop(ctx);
//                 return endFlow('Terminando solicitud. Gracias por utilizar nuestros servicios!');
//             }
//             else{
//                 let lista = state.get('itemsEstados');
//                 const eleccion = parseInt(ctx.body);
//                 let encontrado = false;
//                 for (let i = 0; i < lista.length; i++){
//                     if(lista[i].item == eleccion ){ 
//                         encontrado = true;
//                         let decodedSym = lista[i].estado;
//                         let crs = lista[i].crs;
//                         await state.update({estadoNuevo: decodedSym});
//                         await state.update({crs:crs});
//                         stop(ctx);
//                         return gotoFlow(cambioEstadoScene);
//                     };
//                 };
//                 if(!encontrado){
//                     return fallBack('Por favor, ingresa una opción válida');
//                 };
//             }


//         });

//         const cambioEstadoScene = addKeyword(EVENTS.ACTION)
//         .addAction(async(_, {flowDynamic}) =>{
//             await flowDynamic('Ahora escribe el motivo del cambio de estado:');
//         })
//         .addAction({capture:true}, async(ctx,{state,flowDynamic,gotoFlow,endFlow}) =>{
//             reset(ctx, gotoFlow, 10000);
//             if(['salir','Salir','SALIR','quit','QUIT','0'].includes(normalizeString(ctx.body))){
//                 stop(ctx);
//                 return endFlow('Terminando solicitud. Gracias por utilizar nuestros servicios!');
//             }
//             else{
//                 const contenido = state.get('contenido');
//                 const motivo = normalizeString(ctx.body);
//                 const listaG = JSON.stringify(state.get('ListaPrin'));
//                 const lista = JSON.parse(listaG);
//                 const cnt = lista.ID;
//                 const crs = state.get('crs');
//                 const msg = {
//                     motivo: motivo,
//                     cnt: cnt,
//                     cr: contenido.cr,
//                     crs: crs
//                 };
//                 try {
//                     const response = await axios.post('http://192.168.45.129:8080/WPCambioEstado', msg);
//                     console.log('Datos enviados correctamente:', response.data);
//                     stop(ctx);
//                     return gotoFlow(postCambioEstadoScene);
    
//                 } catch (error) {
//                     if (error.response) {
//                         // El servidor respondió con un código de estado fuera del rango 2xx
//                         console.error('Error en la respuesta del servidor:', error.response.data);
//                         console.error('Código de estado:', error.response.status);
//                         console.error('Encabezados:', error.response.headers);
                        
//                     } else if (error.request) {
//                         // La solicitud fue hecha pero no hubo respuesta
//                         console.error('No hubo respuesta del servidor:', error.request);
                        
//                     } else {
//                         // Algo sucedió al configurar la solicitud
//                         console.error('Error al configurar la solicitud:', error.message);
//                     }
//                     console.error('Configuración de Axios:', error.config);
//                     await flowDynamic('Hubo un error en la consulta. Por favor, inténtalo de nuevo.');
//                     stop(ctx);
//                     return gotoFlow(flowAnalista);
//                 }
//             };

//         });

//         const postCambioEstadoScene = addKeyword(EVENTS.ACTION)
//         .addAction(async(_, {state,flowDynamic})=>{
//             const estado = state.get('estadoNuevo');
//             const contenido = state.get('contenido');
//             const ref_num = contenido.ref_num;
//             await flowDynamic('El cambio de estado a '+ estado + ' para el caso ' + ref_num + ' fue exitoso! ¿Desea realizar alguna otra solicitud? (Sí/No)');
//         })
//         .addAction({capture:true}, async(ctx, {gotoFlow,flowDynamic,endFlow,fallBack}) =>{
//             reset(ctx, gotoFlow, 10000);
//             if(['salir','Salir','SALIR','quit','QUIT','0'].includes(normalizeString(ctx.body))){
//                 stop(ctx);
//                 return endFlow('Terminando solicitud. Gracias por utilizar nuestros servicios!');
//             }
//             else{
//                 let bool = ctx.body;
//                 if(['sí','Si','si','Sí','SI','SÍ','Yes','yes'].includes(normalizeString(bool))){
//                     await flowDynamic('Volviendo al menú inicial.');
//                     stop(ctx);
//                     return gotoFlow(flowAnalista);
//                 }
//                 else if (['No','no','NO'].includes(normalizeString(bool))) {
//                     stop(ctx);
//                     return endFlow('Terminando solicitud. Gracias por utilizar nuestros servicios!');
//                 } else {
//                     stop(ctx);
//                     return fallBack('Por favor, ingresa una opción válida');
//                 };
//             }
//         });

// const main = async () => {
//     const adapterDB = new MockAdapter();
//     const adapterFlow = createFlow([flowInicio, idleFlow, flowAnalista, flowConsultarCasosAnalista,opcionesCasoScene, detalleCasoAnalistaScene, postDetalleAnalistaScene, agregarComentarioAnalistaScene, comentandoScene, postComentarioAnalistaScene, listaEstadoAnalistaScene, cambioEstadoScene, postCambioEstadoScene]);
//     const adapterProvider = createProvider(BaileysProvider);

//     createBot({
//         flow: adapterFlow,
//         provider: adapterProvider,
//         database: adapterDB,
//     });

//     QRPortalWeb();
// };

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