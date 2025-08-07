import { prisma } from "../database/prisma";
import { client } from "../mqtt/client";

//retorna todos os dados de um usuario

export async function handleGetUserData(message:string) {
    const {email, requestId} = JSON.parse(message);

    const user = await prisma.users.findUnique({
        where:{
            email
        },
        include:{
            coletas: true
        }
    })

    const response = {user: user};

    client.publish(
    `user/getUserDataResponse/${requestId}`,
    JSON.stringify(response)
  );
}