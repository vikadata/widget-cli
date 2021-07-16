import { Button, TextInput } from '@vika/components';
import { useCloudStorage, useConfig, useMeta } from '@vika/widget-sdk';
import React from 'react';
import { Setting } from './setting';

export const WidgetDeveloperTemplate: React.FC = () => {
  // 新建图表需要的上下文
  const meta = useMeta();
  const config = useConfig();
  const [counter, setCounter] = useCloudStorage('counter', 0);
  const [text, setText] = useCloudStorage('text', '');
  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <div style={{ flexGrow: 1 }}>
        <h3>组件基本信息</h3>
        <p>组件包名: {meta?.widgetPackageName}</p>
        <p>数表名: {meta?.datasheetName}</p>
        <p>组件实例 ID (widgetId): {meta?.id}</p>
        <p>数据来源表 ID (datasheetId): {meta?.datasheetId}</p>
        <h3>组件自身 config 控制与读取</h3>
        <p>WidgetExpanded: {config.isExpanded + ''} <Button size="small" onClick={() => config.toggleExpand()}>Toggle</Button></p>
        <p>
          WidgetSettingOpened（只允许在展开模式下打开）: {config.isSettingOpened + ''}
          <Button size="small" onClick={() => config.toggleSetting()}>Toggle</Button>
        </p>
        <h3>组件数据存储与协同</h3>
        <p>简单计数器，打开多个窗口，数值可以被持久化并且实时协同</p>
        <p>
          Counter: {counter}
          <Button size="small" onClick={() => setCounter(counter + 1)}>+</Button>
          <Button size="small" onClick={() => setCounter(counter - 1)}>-</Button>
        </p>
        <div>
          Text: <TextInput onChange={e => setText(e.target.value)} value={text}/>
        </div>
      </div>
      {config.isSettingOpened && <Setting />}
    </div>
  );
};
