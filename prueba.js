const http = require('http');

async function ejecutarPrueba() {
    console.log("=========================================");
    console.log("🚀 INICIANDO PRUEBA DE MICROSERVICIOS 🚀");
    console.log("=========================================\n");

    try {
        // 1. INICIAR SESIÓN (Obtener Token)
        console.log("➡️  Paso 1: Obteniendo token de acceso desde el servicio Auth (Puerto 3000)...");
        const loginRes = await fetch("http://localhost:3000/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                correo: "ai@escuela.com",
                contrasena: "123456"
            })
        });
        
        const loginData = await loginRes.json();
        
        if (!loginData.token) {
            console.error("❌ Falló el inicio de sesión. Asegúrate de crear el usuario primero en Postman.");
            return;
        }

        const token = loginData.token;
        console.log("✅ ¡Token obtenido exitosamente!\n");
        console.log("Token: " + token.substring(0, 40) + "...\n");

        // 2. CREAR UN SALÓN
        console.log("➡️  Paso 2: Enviando petición POST al Servicio de Estudiantes (Puerto 3001) usando el Token...");
        const salonRes = await fetch("http://localhost:3001/api/salones", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}` 
            },
            body: JSON.stringify({
                grado: "2do",
                seccion: "B",
                id_maestro: 2
            })
        });

        const salonData = await salonRes.json();

        if (salonRes.ok) {
            console.log("✅ ¡Salón creado exitosamente!\n");
            console.log("📦 RESPUESTA DEL SERVIDOR:");
            console.log(JSON.stringify(salonData, null, 4));
        } else {
            console.log("❌ Hubo un error al crear el salón:");
            console.log(salonData);
        }

        console.log("\n=========================================");
        console.log("✨ PRUEBA FINALIZADA CON ÉXITO ✨");
        console.log("=========================================");

    } catch (error) {
        console.error("Error en la conexión:", error.message);
    }
}

ejecutarPrueba();
