import { prisma } from "../database/prisma";
import { client } from "../mqtt/client";

//edita o perfil

export async function handleEditProfile(message: string) {
  const { newName, email, requestId } = JSON.parse(message);

  //atualiza o nome do usuario pelo o novo nome

  const changeUser = await prisma.users.update({
    where: {
      email,
    },
    data: {
      name: newName,
    },
  });

  if (changeUser) {
    const response = {
      updated: true,
      message: "Usuario atualizado com suceso!",
    };
    client.publish(
      `user/editProfileResponse/${requestId}`,
      JSON.stringify(response)
    );
  } else {
    const response = {
      updated: false,
      message: "Falha ao atualizar o usuario",
    };
    client.publish(
      `user/editProfileResponse/${requestId}`,
      JSON.stringify(response)
    );
  }
}
