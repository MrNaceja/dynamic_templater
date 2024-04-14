import { TTemplateOptions } from "../types";
/**
 * @typedef  {Object                    } TTemplateOptions
 * @property {TTemplateOptionCreatedFile} createdFile
 * @property {TOptionAuthor             } author
 * @property {Object                    } customOptions
 *
 * @typedef  {Object} TTemplateOptionCreatedFile
 * @property {string} fileName
 * @property {string} extension
 * @property {string} directoryFolderName
 * @property {string} directoryPath
 *
 * @typedef  {Object } TOptionAuthor
 * @property {string?} name
 * @property {string?} email
 *
 * @typedef {(options: TTemplateOptions) => string} TTemplateRender
 * @type {TTemplateRender} TTemplateRender
 */
module.exports = (options: TTemplateOptions): string =>
  `
/**
 * The TTemplateOptions options parameter:
 * - createdFile -> {
 *   - filename            -> ${options.createdFile.fileName}
 *   - extension           -> ${options.createdFile.extension}
 *   - directoryFolderName -> ${options.createdFile.directoryFolderName}
 *   - directoryPath       -> ${options.createdFile.directoryPath}
 * }
 * - author -> {
 *   - name  -> ${options.author.name}
 *   - email -> ${options.author.email}
 * }
 * - customOptions -> {
 *   - customValue -> ${options.customOptions.customValue}
 * }
 */
    `.trim();
