import dotenv from "dotenv";
import Discord from "discord.js";
import { Configuration, OpenAIApi } from "openai";
dotenv.config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const client = new Discord.Client({
  intents: [
    Discord.GatewayIntentBits.GuildMessages,
    Discord.GatewayIntentBits.Guilds,
    Discord.GatewayIntentBits.GuildMembers,
    Discord.GatewayIntentBits.MessageContent,
  ],
});

const PREFIX = "!";

const messagesToText = (messages) => {
  return `${messages.map((message) => `${message.author}: ${message.content}`).join("\n")}`;
};

const generateSummary = async (text) => {
  const prompt = `${text}\n\n: Generate a summary with the following sections: 1) list of blockers, 2)who needs help or assitance, 3)find any team members who potentially need to meet with each other, the scrum updates from all team members are posted above `;
  try {
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt,
      max_tokens: 512,
      n: 1,
      stop: null,
      temperature: 0.8,
    });

    return completion.data.choices[0].text.trim();
  } catch (error) {
    if (error.response) {
      console.log(error.response.status);
      console.log(error.response.data);
    } else {
      console.log(error.message);
    }
  }
};

client.on("ready", async () => {
  console.log(`${client.user.tag} has logged in.`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot || !message.content.startsWith(PREFIX)) return;

  const [command, ...args] = message.content.trim().substring(PREFIX.length).split(/\s+/);

  if (command === "summarize") {
    const now = new Date();
    const morning = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);

    const messages = await message.channel.messages.fetch({ after: morning.getTime() });
    const scrumMessages = messages.map((msg) => ({
      author: msg.author.username,
      content: msg.content,
    }));
    console.log(messages);
    const text = messagesToText(scrumMessages);
    console.log("=====================TEXT=====================");
    console.log(text);
    const summary = await generateSummary(text);
    console.log("=====================SUMMARY=====================");
    console.log(summary);
    await message.reply(summary);
  }
});

client.login(process.env.DISCORD_TOKEN);
