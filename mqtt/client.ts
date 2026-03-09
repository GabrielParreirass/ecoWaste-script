import mqtt from "mqtt";

const options = {

  clientId: 'backend_' + Math.random().toString(16).substr(2, 8),
  username: 'csilab',   // corrigido aqui
  password: 'WhoAmI#2024' // corrigido aqui
}


const client = mqtt.connect("mqtt://192.168.66.11:1883", options);

console.log("🔄 Tentando conectar ao broker MQTT...");

client.on("connect", () => {
  console.log("✅ Conectado ao broker MQTT");
});

client.on("reconnect", () => {
  console.log("♻️ Tentando reconectar...");
});

client.on("close", () => {
  console.log("❌ Conexão com broker MQTT foi encerrada");
});

client.on("offline", () => {
  console.log("⚠️ Cliente MQTT está offline");
});

client.on("error", (err) => {
  console.error("❌ Erro na conexão MQTT:", err);
});

export { client };
