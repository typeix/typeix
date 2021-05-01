export interface ApplicationOptions {
  /**
   * Typeix application name.
   */
  name: string;
  /**
   * Typeix application author.
   */
  author?: string;
  /**
   * Typeix application description.
   */
  description?: string;
  /**
   * Typeix application destination directory
   */
  directory?: string;
  /**
   * Typeix application version.
   */
  version?: string;
  /**
   * Application language.
   */
  language?: string;
  /**
   * The used package manager.
   */
  packageManager?: "npm" | "yarn" | "undefined";
  /**
   * Typeix included production dependencies (comma separated values).
   */
  dependencies?: string;
  /**
   * Typeix included development dependencies (comma separated values).
   */
  devDependencies?: string;
}
