// https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=e-guildMemberAdd
const { MessageEmbed } = require("discord.js");
const BaseEvent = require("../utils/structures/BaseEvent");
const { Captcha } = require("captcha-canvas");
const { MessageAttachment } = require("discord.js");

module.exports = class GuildMemberAddEvent extends BaseEvent {
  constructor() {
    super("guildMemberAdd");
  }

  async run(client, member) {
    const captcha = new Captcha(); //create a captcha canvas of 100x300.
    captcha.async = true; //Sync
    captcha.addDecoy(); //Add decoy text on captcha canvas.
    captcha.drawTrace(); //draw trace lines on captcha canvas.
    captcha.drawCaptcha(); //draw captcha text on captcha canvas.

    const captchaAttachment = new MessageAttachment(
      await captcha.png,
      "captcha.png"
    );

    const captchaEmbed = new MessageEmbed()
      .setDescription('Please complete this captcha to get "**verified**":')
      .setImage("attachment://captcha.png");

    const msg = await member.send({
      files: [captchaAttachment],
      embeds: [captchaEmbed],
    });

    const filter = (message) => {
      if (message.author.id !== member.id) return;
      if (message.content === captcha.text) return true;
      else member.send("Wrong captcha.");
    };

    try {
      const response = await msg.channel.awaitMessages({
        filter,
        max: 1,         // Number of messages to successfully pass the filter
        time: 300000,   // 5 min captcha time
        errors: ["time"],
      });

      if (response) {
        // When verified:
        member.roles.add('906790468023627788');
        member.send("You have been verified!");
      }
    } catch (err) {
      // Timeout and unverified
      await member.send("You have not verified.");
    }
  }
};
