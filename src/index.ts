import { Telegraf } from 'telegraf';

import {
  addComment,
  autoupdate,
  deleteAllTaskComments,
  deleteAllTasks,
  deleteTask,
  deleteTaskComment,
  deleteTaskDeadline,
  deleteTaskPostDeadline,
  deleteTaskResponsible,
  deleteTaskTz,
  deleteTaskUrl,
  edits,
  getStats,
  getTasks,
  helpCommandReply,
  limitsCommandReply,
  motivation,
  newTask,
  setTaskDeadline,
  setTaskPostDeadline,
  setTaskResponsible,
  setTaskStatus,
  setTaskTitle,
  setTaskTz,
  setTaskUrl,
  startCommandReply,
} from './commands';
import {
  handleDeleteTask,
  handleSetStatusTask,
  handleUpdateTasks,
  handleRemoveMarkup,
} from './handlers';
import { development, production } from './core';
import { BOT_TOKEN, ENVIRONMENT } from './config';

import type { VercelRequest, VercelResponse } from '@vercel/node';

const bot = new Telegraf(BOT_TOKEN);

bot.command('start', startCommandReply());
bot.command('help', helpCommandReply());
bot.command('limits', limitsCommandReply());

bot.command('new_task', newTask());
bot.command('tasks', getTasks());
bot.command('delete_task', deleteTask());
bot.command('delete_all_tasks', deleteAllTasks());

bot.command('set_deadline', setTaskDeadline());
bot.command('set_post_deadline', setTaskPostDeadline());
bot.command('set_responsible', setTaskResponsible());
bot.command('set_status', setTaskStatus());
bot.command('set_title', setTaskTitle());
bot.command('set_tz', setTaskTz());
bot.command('set_url', setTaskUrl());

bot.command('add_comment', addComment());
bot.command('delete_comment', deleteTaskComment());
bot.command('delete_all_comments', deleteAllTaskComments());

bot.command('delete_responsible', deleteTaskResponsible());
bot.command('delete_deadline', deleteTaskDeadline());
bot.command('delete_post_deadline', deleteTaskPostDeadline());
bot.command('delete_tz', deleteTaskTz());
bot.command('delete_url', deleteTaskUrl());

bot.command('edits', edits());
bot.command('stats', getStats());
bot.command('autoupdate', autoupdate());
bot.command('motivation', motivation());

bot.action(/^delete_task:(\d+)$/, handleDeleteTask());
bot.action(/^update_tasks$/, handleUpdateTasks());
bot.action(/^remove_markup$/, handleRemoveMarkup());
bot.action(/^set_status:(\d+):(\S+)$/, handleSetStatusTask());

export const startVercel = async (req: VercelRequest, res: VercelResponse) => {
  await production(req, res, bot);
};

ENVIRONMENT !== 'production' && development(bot);
