import { prisma } from "../../database/prisma";
import { client } from "../../mqtt/client";

export async function handleCadastrarColetaLixeira(message: string) {
  const nivel = JSON.parse(message);

  const requestId = undefined

  console.log("Client connected: ", client.connected);

  if (nivel == 3 || nivel == 2) {
    console.log("Nao deu o nivel necessario");
    return;
  } else {
    // 1. Busca a lixeira
    const id = "69e8f9b214349b2981c372be";
    const lixeira = await prisma.lixeiras.findFirst({
      where: { id },
    });

    console.log("ID DA LIXEIRA RECEBIDO:", nivel);

    // 2. VALIDAÇÃO CRÍTICA: Se a lixeira não existir, interrompe a função
    if (!lixeira) {
      console.log(`❌ Lixeira com ID ${id} não encontrada no banco de dados.`);
      return;
    }

    // 3. VALIDAÇÃO CRÍTICA: Verifica se a lixeira tem um usuário atrelado
    if (!lixeira.usersId) {
      console.log(`❌ A lixeira ${id} existe, mas não possui um 'usersId' associado.`);
      return; 
    }

    // 4. Verifica se já existe coleta
    const existeColeta = await prisma.coletas.findFirst({
      where: {
        lixeiraId: lixeira.id,
      },
    });

    if (existeColeta) {
      console.log("⚠️ Já existe uma coleta para esta lixeira.");
      return;
    }

    try {
      // 5. Cria a coleta (agora temos certeza que lixeira e usersId existem)
      const addColeta = await prisma.users.update({
        where: {
          id: lixeira.usersId, 
        },
        data: {
          coletas: {
            create: {
              type: lixeira.type ?? "Indefinido", // Evita erro se type for null
              peso: "5Kg",
              dia: "--",
              horario: "--",
              expira: "--",
              status: "disponivel",
              latitude: lixeira.latitude ?? "",
              longitude: lixeira.longitude ?? "",
              lixeiraId: lixeira.id,
            },
          },
        },
      });

      // 6. Publica a resposta de sucesso
      console.log("✅ Publicando no tópico:", `user/cadastrarColetaLixeiraResponse/${requestId}`);
      
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

    } catch (error) {
      // 7. Tratamento de erro caso o update do Prisma falhe
      console.error("❌ Erro ao tentar criar a coleta no banco:", error);
      
      const response = {
        message: "Falha ao cadastrar coleta",
        created: false,
      };
      
      client.publish(
        `user/cadastrarColetaLixeiraResponse/${requestId}`,
        JSON.stringify(response)
      );
    }
  }
}