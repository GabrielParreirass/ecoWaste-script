import { prisma } from "../../database/prisma";
import { client } from "../../mqtt/client";

//entrega na sua resposta todas as coletas reservadas de um coletor específico

export async function handleGetColetasReservadas(message: string) {
  const { email, requestId } = JSON.parse(message);

  console.log("Client connected: ", client.connected);

  //define um coletor atraves do email passado pelo front
  const coletor = await prisma.users.findFirst({
    where: {
      email,
    },
  });

  //se existir um coletor com aquele email, ele retorna as coletas que ele reservou
  if (coletor) {
    const coletasReservadas = await prisma.coletas.findMany({
      where: {
        coletor: coletor.id,
      },
    });
    
    //publica as coletas no topico de resposta
    if (coletasReservadas) {
      console.log(
        "✅ Publicando no tópico:",
        `user/getColetasReservadasResponse/${requestId}`
      );
      console.log("Client connected: ", client.connected);
      const response = { coletas: coletasReservadas };
      client.publish(
        `user/getColetasReservadasResponse/${requestId}`,
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
      const response = { message: "Falçha ao achar coleta", created: false };
      client.publish(
        `user/getColetasReservadasResponse/${requestId}`,
        JSON.stringify(response)
      );
    }
  }
}
