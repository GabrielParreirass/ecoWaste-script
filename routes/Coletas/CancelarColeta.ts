import { prisma } from "../../database/prisma";
import { client } from "../../mqtt/client";



export async function handleCancelarColeta(message: string) {
  const {coletaId, requestId } = JSON.parse(message);

  console.log("Client connected: ", client.connected)

  const removeColeta = await prisma.coletas.delete({
    where:{
        id: coletaId
    }
  })

  if (removeColeta) {
    console.log("✅ Publicando no tópico:", `user/cancelarColetaResponse/${requestId}`);
    console.log("Client connected: ", client.connected)
    const response = { message: "Coleta cancelada com sucesso" };
   client.publish(
  `user/cancelarColetaResponse/${requestId}`,
  JSON.stringify(response),
  { qos: 0, retain: false },
  (err) => {
    if (err) {
      console.error("❌ Erro ao publicar:", err);
    } else {
      console.log("✅ Publicado com sucesso");
    }
  }
);
    console.log("✅ Publicação feita");
  } else {
    const response = { message: "Falçha ao confirmar coleta", created: false };
    client.publish(
      `user/confirmarColetaResponse/${requestId}`,
      JSON.stringify(response)
    );
  }
}
