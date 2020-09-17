const { Util } = require("discord.js");
const fs = require("fs");
const url = require("youtube-url");
const Youtube = require("youtube-stream-url");
const fetch = require("node-fetch");
module.exports.run = async (client, message, args) => {
  if (!message.member.voice.channel)
    return message.channel.send({
      embed: {
        color: client.colors.error,
        description: `${client.emotes.error} | You must be in a voice channel to play!`
      }
    });

  if (
    message.guild.me.voice.channel &&
    message.member.voice.channel.id !== message.guild.me.voice.channel.id
  )
    return message.channel.send({
      embed: {
        color: client.colors.error,
        description: `${client.emotes.error} | You are not in my voice channel!`
      }
    });

  let query = args.join(" ")

  let regXp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  let o = query.match(regXp);
  if (query.includes("https://youtu.be/" || "https://youtube.com/")) {
    const xD = query.youtube_parser();
    fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${xD}&key=AIzaSyAbXxitSfkPxcJkd-RAa4OwDz91mVULfiE`,
      {
        method: "GET",

        headers: {
          Authorization: "Bearer ",
          Accept: "application/json, text/plain, */*",

          "Content-Type": "application/json"
        }
      }
    )
      .then(function(response) {
        return response.json();
      })

      .then(function(result) {
        query = result.items[0].snippet.title;
      })

      .catch(function(error) {
        console.log("Request failed", error);
      });
  } else query = query;

  const searchTracks = await client.player.searchTracks(query).catch(e => {
    return message.channel.send({
      embed: {
        color: client.colors.error,
        description: `${client.emotes.error} | No results found!`
      }
    });
  });

  if (searchTracks.length < 1)
    return message.channel.send({
      embed: {
        color: client.colors.error,
        description: `${client.emotes.error} | No results found!`
      }
    });

  let track = searchTracks[0];

  if (client.player.isPlaying(message.guild.id)) {
    // Add the song to the queue
    let song = await client.player.addToQueue(
      message.guild.id,
      track,
      message.member.user.tag
    );
    return message.channel.send({
      embed: {
        color: client.colors.success,
        description: `${client.emotes.success} | ${Util.escapeMarkdown(
          song.name
        )} by ${Util.escapeMarkdown(song.author)}  Added to the queue!`
      }
    });
  } else {
    // Else, play the song
    let song = await client.player.play(
      message.member.voice.channel,
      track,
      message.member.user.tag
    );
    message.channel.send({
      embed: {
        color: client.colors.success,
        description: `${client.emotes.music} | Now Playing:\n[${song.name}](${song.url}) - ${message.guild.members.cache.find(x => x.user.tag === song.requestedBy).user}`,
     image: {
url: `https://i.ytimg.com/vi/${song.url.slice(32)}/maxresdefault.jpg`
}
 }
    });
    console.log(song);
    client.player.getQueue(message.guild.id).on("end", () => {
      message.channel.send({
        embed: {
          color: client.colors.warning,
          description: `${client.emotes.warning} | Queue completed, add some more songs to play!`
        }
      });
    });

    client.player
      .getQueue(message.guild.id)
      .on("trackChanged", (oldSong, newSong, skipped, repeatMode) => {
        if (repeatMode) {
          message.channel.send({
            embed: {
              color: client.colors.success,
              description: `${client.emotes.repeat} | Repeating:\n ${oldSong.name}`
            }
          });
        } else {
          message.channel.send({
            embed: {
              color: client.colors.success,
              description: `${client.emotes.music} | Now Playing:\n ${newSong.name}`,
     image: {
url: `https://i.ytimg.com/vi/${song.url.slice(32)}/maxresdefault.jpg`
}
            }
          });
        }
      });
  }
};

module.exports.config = {
  name: "play",
  aliases: ["p"]
};
