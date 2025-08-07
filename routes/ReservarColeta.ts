import { prisma } from "../database/prisma";
import { client } from "../mqtt/client";

//reserva a coleta para um coletor

export async function handleReservarColeta(message: string) {
  const { idColeta, coletor, requestId} = JSON.parse(message);

  console.log("Client connected: ", client.connected)

  //acha o perfil do coletor atraves do email

  const findColetor = await prisma.users.findUnique({
    where:{email: coletor}
  })


  //associa a coleta ao coletor, usando seu ID, e troca o status da coleta para reservada
  const updatedColeta = await prisma.coletas.update({
    where:{
        id: idColeta
    },
    data:{
        status:"reservada",
        coletor: findColetor?.id
    }
  });

  if (updatedColeta) {
    console.log("✅ Publicando no tópico:", `user/reservarColetaResponse/${requestId}`);
    console.log("Client connected: ", client.connected)
    const response = { message: "Coleta reservada com sucesso" };
   client.publish(
  `user/reservarColetaResponse/${requestId}`,
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
    const response = { message: "Falçha ao reservar coleta", created: false };
    client.publish(
      `user/reservarColetaResponse/${requestId}`,
      JSON.stringify(response)
    );
  }
}
