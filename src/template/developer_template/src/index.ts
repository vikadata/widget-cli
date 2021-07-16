import { initializeWidget } from '@vika/widget-sdk';
import { WidgetDeveloperTemplate } from './developer_template';

initializeWidget(WidgetDeveloperTemplate, process.env.WIDGET_PACKAGE_ID!);
