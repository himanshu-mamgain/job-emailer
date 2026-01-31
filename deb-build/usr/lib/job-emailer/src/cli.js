#!/usr/bin/env node
import { Command } from 'commander';
import inquirer from 'inquirer';
import Conf from 'conf';
import nodemailer from 'nodemailer';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs';

const program = new Command();
const config = new Conf({ projectName: 'job-emailer' });

program
  .name('job-emailer')
  .description('CLI to send job applications')
  .version('1.0.0');

// Config Command
program.command('config')
  .description('Set up default configuration')
  .action(async () => {
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'service',
        message: 'Select email service:',
        choices: ['gmail', 'outlook', 'other'],
        default: config.get('service') || 'gmail'
      },
      {
        type: 'input',
        name: 'user',
        message: 'Email address:',
        default: config.get('user')
      },
      {
        type: 'password',
        name: 'pass',
        message: 'Email password (or app password):',
        mask: '*'
      },
      {
        type: 'input',
        name: 'resumeUrl',
        message: 'Resume URL (to include in email body):',
        default: config.get('resumeUrl')
      },
      {
        type: 'input',
        name: 'defaultResumePath',
        message: 'Default Resume PDF path (optional, leave empty to skip):',
        default: config.get('defaultResumePath')
      }
    ]);
    
    config.set(answers);
    console.log(chalk.green('Configuration saved!'));
  });

// Apply Command
program.command('apply')
  .description('Send a job application email')
  .argument('<email>', 'Recruiter email')
  .argument('<jobTitle>', 'Job Title')
  .option('-c, --cover-letter <path>', 'Path to cover letter file')
  .option('-r, --resume <path>', 'Path to resume file (overrides default)')
  .option('--no-resume', 'Do not attach resume even if default exists')
  .action(async (email, jobTitle, options) => {
    // Check config
    if (!config.get('user') || !config.get('pass')) {
      console.log(chalk.red('Please run "job-emailer config" first!'));
      return;
    }

    // Construct Email
    const service = config.get('service');
    const transporter = nodemailer.createTransport({
      service: service === 'other' ? undefined : service,
      host: service === 'other' ? 'smtp.gmail.com' : undefined, // Fallback default
      auth: {
        user: config.get('user'),
        pass: config.get('pass')
      }
    });

    const resumeUrl = config.get('resumeUrl');
    
    // Attachments
    const attachments = [];
    
    // Resume Logic
    let resumePath = options.resume || config.get('defaultResumePath');
    if (options.resume !== false && resumePath) {
       // Validate path
       if (fs.existsSync(resumePath)) {
         attachments.push({ path: resumePath });
       } else {
         console.log(chalk.yellow(`Resume file not found at ${resumePath}, skipping attachment.`));
       }
    }

    // Cover Letter Logic
    let textContent = `Dear Hiring Manager,\n\nI am writing to apply for the ${jobTitle} position.\n\nPlease find my resume attached.`;
    if (resumeUrl) {
      textContent += `\n\nYou can also view my resume online here: ${resumeUrl}`;
    }
    
    if (options.coverLetter) {
        if (fs.existsSync(options.coverLetter)) {
            // Check extension
            if (options.coverLetter.endsWith('.txt')) {
                 textContent = fs.readFileSync(options.coverLetter, 'utf-8');
            } else {
                attachments.push({ path: options.coverLetter });
            }
        } else {
             console.log(chalk.yellow(`Cover letter file not found at ${options.coverLetter}`));
        }
    }
    
    textContent += `\n\nBest regards,\n${config.get('user')}`; // Using email as name for now if name not set

    const mailOptions = {
      from: config.get('user'),
      to: email,
      subject: `Application for ${jobTitle}`,
      text: textContent,
      attachments: attachments
    };

    try {
        console.log(chalk.blue(`Sending email to ${email}...`));
        await transporter.sendMail(mailOptions);
        console.log(chalk.green(`Application sent successfully!`));
    } catch (error) {
        console.error(chalk.red('Failed to send email:'), error.message);
    }
  });

program.parse(process.argv);
