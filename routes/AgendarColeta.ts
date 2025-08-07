import { prisma } from "../database/prisma";
import { client } from "../mqtt/client";

//agenda coleta - apenas para usuarios que nao possuem lixeira

export async function agendarColeta(message: string) {
  const { email, tipo, peso, diaSem, horario, requestId, latitude, longitude } = JSON.parse(message);

  console.log("Client connected: ", client.connected)

  //adiciona a coleta com base nos dados passados na publicação

  const addColeta = await prisma.users.update({
    where: {
      email: email,
    },
    data: {
      coletas: {
        create: {
          type:tipo,
          peso,
          dia:diaSem,
          horario,
          expira: "--",
          status: "disponivel",
          latitude,
          longitude
        },
      },
    },
  });

  if (addColeta) {
    console.log("✅ Publicando no tópico:", `user/agendarColetaResponse/${requestId}`);
    console.log("Client connected: ", client.connected)
    const response = { message: "Coleta agendada com sucesso", created: true };
   client.publish(
  `user/agendarColetaResponse/${requestId}`,
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
    const response = { message: "Falçha ao agendar coleta", created: false };
    client.publish(
      `user/agendarColetaResponse/${requestId}`,
      JSON.stringify(response)
    );
  }
}
