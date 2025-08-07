import { prisma } from "../database/prisma";
import { client } from "../mqtt/client";

//resgate de cupons

export async function handleAddCupon(message: string) {
  const { loggedEmail, cupponName, cupponValue, requestId } =
    JSON.parse(message);

  const randomId = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;

  const user = await prisma.users.findUnique({
    where: {
      email: loggedEmail,
    },
  });

  //compara para ver se o usuario tem saldo suficiente para resgatar o cupon
  if (user!.ecoCoins < 100) {
    const response = { message: "Saldo indisponivel para resgatar o cupon" };
    client.publish(
      `user/addCuponResponse/${requestId}`,
      JSON.stringify(response)
    );
    return;
  }

  //transoforma a lista de cupons do usuario em um array
  const currentCupons = Array.isArray(user!.cupons) ? user!.cupons : [];


  //adiciona o cupon desejado no array
  currentCupons.push({
    id: randomId,
    name: cupponName,
    value: cupponValue,
  });

  //atualiza a lista de cupons do usuario e debita o valor do cupon
  const addCupon = await prisma.users.update({
    where: {
        email: loggedEmail
      },
      data: {
        cupons: currentCupons,
        ecoCoins: user!.ecoCoins - 100
      }
  })

  if(addCupon){
    const response = {message:"Cupon adicionado com sucesso!"};
     client.publish(
      `user/addCuponResponse/${requestId}`,
      JSON.stringify(response)
    );
  }else{
    const response = {message:"Falha ao adicionar cupon"};
     client.publish(
      `user/addCuponResponse/${requestId}`,
      JSON.stringify(response)
    );
  }
}
