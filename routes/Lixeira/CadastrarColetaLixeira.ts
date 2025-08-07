import { prisma } from "../../database/prisma";
import { client } from "../../mqtt/client";

//topico que faz o cadastro automatico da coleta da lixeira quando ela esta cheia

export async function handleCadastrarColetaLixeira(message: string) {
  const { id, nivel, requestId } = JSON.parse(message);

  console.log("Client connected: ", client.connected);

  //recebe o nivel da lixeira através da publicação que ela faz
  //se o nivel for 2 ou 3, significa lixeira vazia
  //se o nivel for 1, ela esta cheia. A partir dai ele cria a coleta

  if (nivel == 3 || nivel == 2) {
    console.log("Nao deu o nivel necessario")
    return;
  } else {
    const lixeira = await prisma.lixeiras.findFirst({
      where: {
        id,
      },
    });
    //verifica se ja existe uma coleta naquela lixeira, para evitar erros e coletas duplicadas
    const existeColeta = await prisma.coletas.findFirst({
      where: {
        lixeiraId: lixeira?.id!,
      },
    });
    // se ja existir uma coleta, ele sai da funcao, caso contrario, ele cria a coleta
    if (existeColeta) {
      return;
    } else {
      //atribui uma coleta am usuario com os dados da lixeira vindos do id na publicação
      const addColeta = await prisma.users.update({
        where: {
          id: lixeira?.usersId!,
        },
        data: {
          coletas: {
            create: {
              type: lixeira?.type!,
              peso: "5Kg",
              dia: "--",
              horario: "--",
              expira: "--",
              status: "disponivel",
              latitude: lixeira?.latitude!,
              longitude: lixeira?.longitude!,
              lixeiraId: lixeira?.id!,
            },
          },
        },
      });

      //publica a resposta
      if (addColeta) {
        console.log(
          "✅ Publicando no tópico:",
          `user/cadastrarColetaLixeiraResponse/${requestId}`
        );
        console.log("Client connected: ", client.connected);
        const response = {
          message: "Coleta criada com sucesso",
          created: true,
        };
        client.publish(
          `user/cadastrarColetaLixeiraResponse/${requestId}`,
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
        const response = {
          message: "Falçha ao cadastrar coleta",
          created: false,
        };
        client.publish(
          `user/cadastrarColetaLixeiraResponse/${requestId}`,
          JSON.stringify(response)
        );
      }
    }
  }
}
