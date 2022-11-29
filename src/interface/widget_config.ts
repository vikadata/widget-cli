export interface IWidgetConfig {
  /** [read-only] The ID of the widget code package, which is automatically generated during initialization. */
  packageId: string;
  /** [read-only] Id of the global widget code package, automatically generated when published to the global. */
  globalPackageId?: string;
  /** Space Station ID, the widget must be bound to a space station. */
  spaceId: string;
  /** Widget code version, fixed three-digit version number, each release needs to be updated, please follow the semver principle to update. */
  version: string;
  /** Widget code entry, support js and ts. */
  entry: string;
  /** The name of the widget, displayed in the widget installation screen. */
  name: {[key: string]: string};
  /**
   * The path of the widget icon is automatically uploaded
   * when publishing and displayed in the widget installation interface,
   * please use 64x64 png file.
   */
  icon: string;
  /**
   * The cover image of the widget will be uploaded automatically when
   * it is published and displayed in the widget installation interface,
   * please use a 16:9 image, 640 × 360 png or jpg file is recommended.
   */
  cover: string;
  /**
   * The cover image of the widget will be uploaded automatically when
   * it is published and displayed in the widget installation interface,
   * please use a 16:9 image, 640 × 360 png or jpg file is recommended.
   */
  authorName: string;
  /**
   * Author icon path, automatically uploaded when publishing,
   * displayed in the widget installation screen, please use 64x64 png file.
   */
  authorIcon: string;
  /** [Optional] Author address, click on the author icon to jump. */
  authorLink: string;
  /** [Optional] Author Email address. */
  authorEmail: string;
  /** Widget description, displayed in the widget installation screen. */
  description: {[key: string]: string};
  /** [Optional] Whether to enable iframe mode for widget rendering. */
  sandbox?: boolean;
  /** Widget home page. */
  website?: string;
}
