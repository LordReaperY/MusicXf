const Discord = require("discord.js")
const fs = require("fs")

module.exports.run = async (client, message, args) => {
  
if(!message.member.voice.channel) return message.channel.send({embed: {color: client.colors.error, description: `${client.emotes.error} | You must be in a voice channel!` }})

if (message.guild.me.voice.channel && message.member.voice.channel.id !== message.guild.me.voice.channel.id) return message.channel.send({embed: {color: client.colors.error, description: `${client.emotes.error} | You are not in my voice channel!`}});
  
if(!client.player.isPlaying(message.guild.id)) return message.channel.send({embed: {color: client.colors.error, description: `${client.emotes.error} | You must be in a voice channel!` }})
if(client.player.getQueue(message.guild.id).repeatMode === false){
client.player.setRepeatMode(message.guild.id, true);
  message.channel.send("🔁 | Loop has been turned on!")
 }// Get the current song
  else if(client.player.getQueue(message.guild.id).repeatMode === true) {
    client.player.setRepeatMode(message.guild.id, false)
    message.channel.send("🔁 | Loop has been turned off!")
  }
 let song = await client.player.nowPlaying(message.guild.id);
  
}

module.exports.config = {
  name: "loop",
  aliases: ['repeat']
}
