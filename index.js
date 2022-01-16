const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => res.send('Hello World!'));

app.listen(port, () => console.log(`${port}`));
/* ---------------------------------------------------------------------- */

const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs')
const prefix = '*'
const Pagination = require('discord-paginationembed')

const memberRole = "713418225362403370";//member role in main server

/* ======================================================================= 
                  Ready
======================================================================= */
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setPresence({
    status: 'online',
    activity: {
        name: '**AlphaBet**',
        type: 'WATCHING'
    }
})
});
/* ======================================================================= 
                  Message
======================================================================= */
client.on('message', async message =>{
  const users = JSON.parse(fs.readFileSync('./data/bannedids.json'))
  const introductionChannel = message.guild.channels.cache.find(channel => channel.name.includes('introduction') && channel.type === 'text').id
  
  const args = message.content.slice(prefix.length).trim().split(" ");
  if(message.author.id === client.user.id) return;

  /* --- Giving member role after member introducing themelf----------- */
  // merge with Intern bot and use that token
  if(message.channel.id === introductionChannel){
    message.react('👋')
		let introrole = message.guild.roles.cache.get(memberRole)
		message.member.roles.add(introrole)
  }
  /* ---------------------------------------------------------------------- */
  if(message.content.startsWith(`${prefix}listid`)){
    if(!message.member.hasPermission('KICK_MEMBERS')) return message.channel.send('Incorrect Permissions!')
    let dang_arr = []
    let command = message.content.split(" ")
    command.forEach(command => users['users'].push({id:command}))

    fs.writeFile('./data/bannedids.json', JSON.stringify(users), function(err) {
        if (err) return console.log(err);
        console.log('Updated file')
      })
    const embed = new Discord.MessageEmbed()
    .setDescription("**" + (command.length - 1) + "** ID's Were added to the dangerous members list.")
    .setColor('YELLOW')

    message.channel.send(embed)
  }
  /* ---------------------------------------------------------------------- */
  if(message.content.startsWith(`${prefix}help`)){
    if(!message.member.hasPermission('ADMINISTRATOR')) return message.channel.send('Incorrect Permissions!')
      const embed = new Discord.MessageEmbed()
      .setAuthor(client.user.username, client.user.displayAvatarURL())
      .setDescription('Help is here!')
      .addField('*add <userid>', 'This command allows you to add a member to the list!')
      .addField('*listid <userid>, <userid>', 'This command allows you to add a list of ids to the List!')
      .addField('*remove <userid>', 'This command allows you to remove a member from the list!')
      .addField('*dl', 'This command allows you to view the dangerous members list!')
      .addField('*help', 'This command allows you to view this message!')
      .setTimestamp()
      .setFooter(message.guild.name, message.guild.iconURL())
      .setColor('YELLOW')

      message.channel.send(embed)
    }
  /* ---------------------------------------------------------------------- */
  if(message.content.startsWith(`${prefix}remove`)){
    if(!message.member.hasPermission('ADMINISTRATOR')) return message.channel.send('Incorrect Permissions!')
    let check = true
    const mentioned = args[1]

    users['users'].forEach(function(part, index, array){
      if(array[index].id === mentioned){
        let check = true
      }else{
        let check = false
      }
    })
    if(check = false){
      message.channel.send('This member you mentioned is not in the Dangerous Members List.\nIf you would like to add them to the list use @add <id>')
    }
    if(check = true){
        const idToRemove = args[1]
        const filterArray = {'users':users['users'].filter((item) => item.id !== idToRemove)};

      fs.writeFile('./data/bannedids.json', JSON.stringify(filterArray), function(err) {
        if (err) return console.log(err);
        console.log('Updated file')
      })
      message.channel.send(`${mentioned} Has been Removed from the List`)

    
    }
  }

  /* ---------------------------------------------------------------------- */
  if(message.content.startsWith(`${prefix}add`)){
    if(!message.member.hasPermission('ADMINISTRATOR')) return message.channel.send('Incorrect Permissions!')
    let check = true
    console.log('Add command was run.')
    const mentioned = args[1]
    users['users'].forEach(function(part, index, array){
      // if(array[index].id !== mentioned.id) {check = false} //yhyh i realised but it work so yeah
      if(array[index].id === mentioned.id){
        let check = true
      }else{
        let check= false
      }
    })
    if(check = true){
      users['users'].push({"id": mentioned});
        message.channel.send(`\`${mentioned}\`` + " Has been added to the Dangerous member List!")
        fs.writeFile('./data/bannedids.json', JSON.stringify(users), function(err) {
        if (err) return console.log(err);
        console.log('Updated file')
      })
    }
    if(check = false){
      message.channel.send('Member already in the Database')
    }
    
  };
  /* ---------------------------------------------------------------------- */
  if(message.content.startsWith(`${prefix}dl`)){
    if(!message.member.hasPermission('ADMINISTRATOR')) return message.channel.send('Incorrect Permissions!')
    let testArray = []

    users["users"].forEach(a => testArray.push({ id: a.id}))

    const FieldsEmbed = new Pagination.FieldsEmbed()
      .setArray(testArray)
      .setAuthorizedUsers([message.author.id])
      .setChannel(message.channel)
      .setElementsPerPage(10)
      .setPageIndicator(true)
      .formatField('Dangerous Members ', el =>  '•' + el.id)
    FieldsEmbed.embed
      .setColor('YELLOW')
      .setAuthor(client.user.username, client.user.displayAvatarURL())
      .setTimestamp()
      .setFooter(message.guild.name, message.guild.iconURL())
    FieldsEmbed.build()
  }
})

/* ======================================================================= 
              New member join
======================================================================= */
client.on('guildMemberAdd', async (member) => {
  const sendChannel = member.guild.channels.cache.find(channel => channel.name.includes('mod-logs') && channel.type === 'text')
  const users = JSON.parse(fs.readFileSync('./data/bannedids.json'));
  let check = false;
  
  console.log("Join member = " + member.user.id);
  console.log("--------------------------------");
  //Goes through all ids and find member that joins
  users['users'].forEach(function(part, index, array){
      if(member.user.id === array[index].id){
        let check = true;
        console.log('Found');
        const embed = new Discord.MessageEmbed()
        .setAuthor(client.user.username, client.user.displayAvatarURL())
        .setDescription('**ALERT:**\n<@' + member.user.id + "> Is on the Dangerous Member list therefore they were banned!")
        .addField("User Information:", `User:\n<@${member.user.id}>\nUsername: ${member.user.username}\nUser ID:\n${member.user.id}\nCreated At:\n${member.user.createdAt}`)
        .setColor('YELLOW')
        .setTimestamp()
        .setFooter(member.guild.name, member.guild.iconURL())
        sendChannel.send(embed)
        member.ban()
        console.log('Member Banned!');
    };
});
});

client.login('ODQ2MTA2MDc0ODM0NjY1NTAy.YKqrsA.GvVESbUw0_U1Mdkvwz9rCqf_Xn0');