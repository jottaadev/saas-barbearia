// hash-passwords.js
const bcrypt = require('bcryptjs');
const db = require('./src/config/database');

async function updateUserPassword() {
  // O script agora espera 2 argumentos: o username e a nova senha
  const args = process.argv.slice(2); // Pega os argumentos da linha de comando
  const username = args[0];
  const newPassword = args[1];

  if (!username || !newPassword) {
    console.error('ERRO: É necessário fornecer um NOME DE UTILIZADOR e uma NOVA SENHA.');
    console.error('Exemplo de uso: node hash-passwords.js diego novasenha123');
    return;
  }

  console.log(`A encriptar a nova senha para o utilizador: ${username}...`);

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  console.log(`Nova senha encriptada: ${hashedPassword}`);

  const result = await db.query(
    "UPDATE barbers SET password_hash = $1 WHERE username = $2",
    [hashedPassword, username]
  );

  if (result.rowCount > 0) {
    console.log(`✅ Sucesso! A senha do utilizador '${username}' foi atualizada.`);
  } else {
    console.error(`AVISO: Nenhum utilizador com o nome '${username}' foi encontrado.`);
  }
}

updateUserPassword().catch(console.error);