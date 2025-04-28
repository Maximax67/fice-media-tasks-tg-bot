import { Telegraf } from 'telegraf';

import {
  addComment,
  addStatus,
  autoupdate,
  deleteAllTaskComments,
  deleteAllTasks,
  deleteStatus,
  deleteTask,
  deleteTaskComment,
  deleteTaskDeadline,
  deleteTaskPostDeadline,
  deleteTaskResponsible,
  deleteTaskTz,
  deleteTaskUrl,
  disableAutoupdate,
  edits,
  getLeaderboard,
  getStats,
  getStatuses,
  getTasks,
  getTasksMessage,
  helpCommandReply,
  joinThreadsTasks,
  limitsCommandReply,
  motivation,
  newTask,
  resetChat,
  separateThreadsTasks,
  setChangeStatusEvent,
  setMotivation,
  setTaskDeadline,
  setTaskPostDeadline,
  setTaskResponsible,
  setTaskStatus,
  setTaskTitle,
  setTaskTz,
  setTaskUrl,
  startCommandReply,
  suggestResponsible,
} from './commands';
import {
  handleDeleteTask,
  handleSetStatusTask,
  handleUpdateTasks,
  handleRemoveMarkup,
  handleUpdatePicture,
  handleChangeStatusEventPagination,
  handleRemoveStatusEvent,
  handleSetStatusEvent,
  handleSetMotivation,
  handleResetChat,
  handleCancelResetChat,
} from './handlers';
import { development, production } from './core';
import { BOT_TOKEN, ENVIRONMENT } from './config';

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { addLink } from './commands/add_link';
import { deleteLink } from './commands/delete_link';
import { deleteAllLinks } from './commands/delete_all_links';

const bot = new Telegraf(BOT_TOKEN);

bot.command('start', startCommandReply());
bot.command('help', helpCommandReply());
bot.command('limits', limitsCommandReply());

bot.command('new_task', newTask());
bot.command('tasks', getTasks());
bot.command('delete_task', deleteTask());
bot.command('delete_all_tasks', deleteAllTasks());

bot.command('statuses', getStatuses());
bot.command('add_status', addStatus());
bot.command('delete_status', deleteStatus());
bot.command('set_change_status_event', setChangeStatusEvent());

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

bot.command('add_link', addLink());
bot.command('delete_link', deleteLink());
bot.command('delete_all_links', deleteAllLinks());

bot.command('delete_responsible', deleteTaskResponsible());
bot.command('delete_deadline', deleteTaskDeadline());
bot.command('delete_post_deadline', deleteTaskPostDeadline());
bot.command('delete_tz', deleteTaskTz());
bot.command('delete_url', deleteTaskUrl());

bot.command('edits', edits());
bot.command('stats', getStats());
bot.command('autoupdate', autoupdate());
bot.command('tasks_message', getTasksMessage());
bot.command('disable_autoupdate', disableAutoupdate());
bot.command('motivation', motivation());
bot.command('set_motivation', setMotivation());
bot.command('leaderboard', getLeaderboard());
bot.command('suggest_responsible', suggestResponsible());

bot.command('separate_threads_tasks', separateThreadsTasks());
bot.command('join_threads_tasks', joinThreadsTasks());
bot.command('reset_chat', resetChat());

bot.action(/^delete_task:(\d+)$/, handleDeleteTask());
bot.action(/^update_tasks$/, handleUpdateTasks());
bot.action(/^update_picture:(\S+)$/, handleUpdatePicture());
bot.action(/^remove_markup$/, handleRemoveMarkup());
bot.action(/^set_status:(\d+):(\d+)$/, handleSetStatusTask());
bot.action(/^set_motivation:(\S+)$/, handleSetMotivation());

bot.action(/^csep:(\d+):(\d+)$/, handleChangeStatusEventPagination());
bot.action(/^rse:(\d+):(\d+):(\d+)$/, handleRemoveStatusEvent());
bot.action(/^sse:(\d+):(\d+):(\S+)$/, handleSetStatusEvent());

bot.action(/^reset_chat$/, handleResetChat());
bot.action(/^cancel_reset_chat$/, handleCancelResetChat());

export const startVercel = async (req: VercelRequest, res: VercelResponse) => {
  await production(req, res, bot);
};

ENVIRONMENT !== 'production' && development(bot);
