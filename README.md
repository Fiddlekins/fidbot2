# fidbot2
A bot for discord.  
All of the Fiddles.  
Less of the snark.

Click [here](https://discord.com/api/oauth2/authorize?client_id=1188033039801012354&permissions=134217728&scope=applications.commands+bot) to add it.

## New bot, what gives?

The [previous iteration of fidbot](https://github.com/Fiddlekins/fidbot) was last updated 7 years ago.
A testament to the robust work from the discordjs maintainers at that time that it worked this well this long perhaps?

Nevertheless, there have been moments throughout those years that the bot died for reasons I never managed to pin down.
This was largely ignorable until recently (EOY 2023) when there was a rash of fidbot failures.

I chose to spend the time rewriting fidbot to use the latest iteration of discordjs, which has changed substantially since before to keep pace with the changes Discord itself has made to how bots work with it. Most notably are the "slash commands" and rich interactions with buttons and modals and the like.

It is my hope that being on an up to date framework will result in greater stability for fidbot, whilst also generally refining the experience. 

## Migrating from legacy fidbot

1. Remove the original fidbot
2. Add the new fidbot2 using the link above
3. Run `/settings` (must have admin or manage server perms) to view and configure the new features
4. (Optional) Manually drag the "Fidbot 2.0" role that should be created when inviting the bot as high as it will go on the role list. Some features will not work otherwise

## Featurelist

#### `/settings`

This brings up a collection of buttons named after commands or features.
Clicking the button toggles the corresponding feature being enabled.
For commands, being disabled does not remove them from the command list due to technical limitations.
Instead, any user that executes a disabled command receives a bot response that only they can see rather than being viewable by other users.

In order to fully hide commands from the command list, a server admin or manager can configure override behaviour in the server integration settings.
This allows the command to be disabled based for roles, channels or specific users, whereupon affected users will have it disappear from their command list.

### Commands

These are features that are triggered by entering a command, initiated by typing `/` into the message box.

#### `/autoreply`

Allows server admins to configure Fidbot to automatically reply to messages.

When a new message is read by Fidbot it will check whether there are any rules in place that match it.
A rule can be restricted to only apply to a specific user.
There is the ability to further filter by matching the message against a regex pattern.

The response itself is largely static, but can contain the following templated values:
- `<user>` will be replaced by a discord mention of the user who posted the message this is in reply to

The regex patterns use the following [syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions) but with some restrictions, mainly the inability to use the forward and back referencing.
This is to avoid you cretins submitting a hilarious combination of regex and input that locks the bot up computing the result for all eternity in what's known as a ReDoS attack.

It is worth noting that when there are multiple matching rules, only three will be executed.
It prioritises user specific rules over generic rules, and within each category it prioritises by how recently created the rule is.

##### `/autoreply create <response> <?user> <?match>`

Creates a new autoreply rule.
The `response` parameter is the text that Fidbot will respond with when executing a reply.

The optional `user` parameter allows the rule to be constrained to only being applied to messages made by that user.
Omitting it will have Fidbot check the rule against every message.

The optional `match` parameter allows the rule to be constrained by the message content.
This is used as a regex pattern, allowing for a wide range of matching options.
At its simplest, you can treat it as a simple substring check - using `ping` as the value for this parameter will make Fidbot respond to any message that contains that text, such as "I like to play pingpong".
Conversely, using basic regex such as using `[0-9]` for this parameter will make it respond to any message that contains a numerical digit.

##### `/autoreply list <?response> <?user> <?match>`

Fidbot displays a list of autoreply rules that only the user of the command can see.
This provides the ID for each rule, which is required when wanting to delete a rule.

The optional parameters will filter down the listed output to make it easier to manage lots of rules. 

##### `/autoreply remove <id>`

This removes a rule.
The ID can be obtained by finding the rule in the list output.

#### `/akun`

A collection of tools for interacting with Akun, a quest website.

##### `/akun dice <input>`

Executes `input` as an Akun dice command and returns the result.

##### `/akun live <?page>`

Queries Akun for the currently live quests and displays a set of links to them.

If the results outnumber the maximum number of links Discord supports then pagination controls are added.
These controls can be interacted with by all users that can see the output, potentially leading to users deliberately interfering with one another.
The "Finish" button allows a user to freeze the output on the current page.

The optional `page` parameter allows the user to specify the initial page to display, which can be used to circumvent other users calling "Finish" before the initiator navigates to the desired page.

##### `/akun query <title>`

Queries Akun for the given quest `title`, returning an overview of it if found.

Resolving quest titles relies on a local cache which cannot guarantee completeness (due to some quests being unpublished, and thus undiscoverable, and other quests having their title edited to a value that Fidbot hasn't cached).

A user can force guaranteed retrieval by submitting a quest ID for the `title` parameter.

#### `/call <subject> <descriptor>`

Fidbot will accuse `subject` of being a `descriptor`.

#### `/choice <choices>`

Fidbot will randomly pick a choice for the user.

The `choices` parameter must be formatted as a series of `;` separated outcomes.

#### `/nickname`

As a janitor of a server, do you ever get into a tussle with a user over that user's nickname? You have this brilliant nickname for them, yet they keep insisting on changing it to something else?

Ever wished you could automate the scuffle for your own convenience?

That's what this command is for, with a random delay (3 seconds to 5 minutes) introduced to allow the target user to believe they are engaging in a fair fight with a human.

##### `/nickname free <?user>`

Fidbot displays a list only the user of the command can see of the current users with locked nicknames.
The list items are buttons, and clicking them will free that user from nickname jail.

This command does not change their nickname, it simply stops Fidbot from automatically changing it in the future.

The optional `user` parameter can be used to free a known locked user directly without going through the button menu.

##### `/nickname lock <user> <?locked-name>`

Locks the given `user` with their current nickname.

If the `locked-name` parameter is provided then this becomes their locked name, rather than their existing nickname, and their nickname is also immediately updated to `locked-name`.

#### `/roll <input>`

Roll complex RPG dice by executing the `input` parameter.

Instructions on syntax can be found [here](https://dice-roller.github.io/documentation/guide/notation/).

#### `/wide <text>`

Makes Fidbot say the given `text` but wider.

#### `/8ball <question>`

Fidbot will consult a Magic 8 Ball for the answer to your given `question`.

### Features

These are passive features that are not triggered by a command.

#### Awoo Policing

Users will be briefly reminded that posts with the sequence of letters `awoo` found in them are illegal and carry a fine of $350.

#### Twitter Embed

At this point in time, for some reason, Discord cannot embed posts hosted by https://twitter.com or https://x.com.
Third parties have built workarounds for this issue, by feeding those posts through their proxy which provides a proper link preview embed to Discord instead.
The one caveat: it requires users to use them.

Fidbot's twitter embed feature will automatically detect un-proxied URLs and post alongside them with the proxied version, thus triggering the embed.

For this to work, the Fidbot BOT user in discord must be present in the channel.
Channels that are private will need to explicitly add Fidbot (like one would any other user) for this feature to work in them.

## Feedback

Feel free to holler at me on Discord, GitHub, or my gmail.
I get enough spam as it is, so handles and addresses are left as an exercise for the reader.
