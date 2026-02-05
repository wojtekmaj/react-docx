import { createContext } from 'react';
import Reconciler from 'react-reconciler';

import type { HostConfig } from 'react-reconciler';
import type {
  Container,
  DocxChild,
  DocxNode,
  DocxNodeType,
  DocxProps,
  HostContext,
  TextNode,
} from './types.js';

let currentUpdatePriority = 0;

function createDocxNode(type: DocxNodeType, props: DocxProps): DocxNode {
  return {
    type,
    props,
    children: [],
  } as DocxNode;
}

type HostTransitionContextType = HostConfig<
  DocxNodeType,
  DocxProps,
  Container,
  DocxChild,
  DocxChild,
  unknown,
  unknown,
  unknown,
  unknown,
  unknown,
  unknown,
  unknown,
  unknown,
  unknown
>['HostTransitionContext'];

const hostConfig: HostConfig<
  DocxNodeType,
  DocxProps,
  Container,
  DocxChild,
  DocxChild,
  unknown,
  unknown,
  unknown,
  unknown,
  unknown,
  unknown,
  unknown,
  unknown,
  unknown
> = {
  supportsMutation: true,
  isPrimaryRenderer: true,
  supportsPersistence: false,
  supportsHydration: false,
  noTimeout: -1,

  getRootHostContext() {
    return { isInsideText: false } satisfies HostContext;
  },
  getChildHostContext(_parentHostContext: HostContext, type: string) {
    return { isInsideText: type === 'TEXT' } satisfies HostContext;
  },
  shouldSetTextContent() {
    return false;
  },
  createInstance(type: DocxNodeType, props: DocxProps) {
    return createDocxNode(type, props);
  },
  createTextInstance(text: string) {
    return {
      type: 'TEXT_INSTANCE',
      text,
    } satisfies TextNode;
  },
  appendInitialChild(parent: DocxChild, child: DocxChild) {
    if ('children' in parent) {
      parent.children.push(child);
    }
  },
  appendChild(parent: DocxChild, child: DocxChild) {
    if ('children' in parent) {
      parent.children.push(child);
    }
  },
  appendChildToContainer(container: Container, child: DocxChild) {
    container.children.push(child);
  },
  insertBefore(parent: DocxChild, child: DocxChild, beforeChild: DocxChild) {
    if (!('children' in parent)) {
      return;
    }

    const index = parent.children.indexOf(beforeChild);

    if (index >= 0) {
      parent.children.splice(index, 0, child);
    } else {
      parent.children.push(child);
    }
  },
  insertInContainerBefore(container: Container, child: DocxChild, beforeChild: DocxChild) {
    const index = container.children.indexOf(beforeChild);

    if (index >= 0) {
      container.children.splice(index, 0, child);
    } else {
      container.children.push(child);
    }
  },
  removeChild(parent: DocxChild, child: DocxChild) {
    if (!('children' in parent)) {
      return;
    }

    const index = parent.children.indexOf(child);
    if (index >= 0) {
      parent.children.splice(index, 1);
    }
  },
  removeChildFromContainer(container: Container, child: DocxChild) {
    const index = container.children.indexOf(child);
    if (index >= 0) {
      container.children.splice(index, 1);
    }
  },
  finalizeInitialChildren() {
    return false;
  },
  commitUpdate(
    instance: DocxChild,
    _type: string,
    _oldProps: DocxProps,
    newProps: DocxProps,
    _internalHandle,
  ) {
    if ('props' in instance) {
      instance.props = newProps;
    }
  },
  commitTextUpdate(textInstance: TextNode, _oldText: string, newText: string) {
    if (textInstance.type === 'TEXT_INSTANCE') {
      textInstance.text = newText;
    }
  },
  resetAfterCommit() {},
  clearContainer(container: Container) {
    container.children = [];
  },
  getPublicInstance(instance: DocxChild) {
    return instance;
  },
  prepareForCommit() {
    return null;
  },
  preparePortalMount() {},
  scheduleTimeout: setTimeout,
  cancelTimeout: clearTimeout,
  getInstanceFromNode() {
    return null;
  },
  beforeActiveInstanceBlur() {},
  afterActiveInstanceBlur() {},
  prepareScopeUpdate() {},
  getInstanceFromScope() {
    return null;
  },
  detachDeletedInstance() {},
  NotPendingTransition: null,
  HostTransitionContext: createContext({
    isInsideText: false,
  } satisfies HostContext) as unknown as HostTransitionContextType,
  setCurrentUpdatePriority(newPriority) {
    currentUpdatePriority = newPriority;
  },
  getCurrentUpdatePriority() {
    return currentUpdatePriority;
  },
  resolveUpdatePriority() {
    return currentUpdatePriority;
  },
  resetFormInstance() {},
  requestPostPaintCallback(callback) {
    setTimeout(() => {
      callback(Date.now());
    }, 0);
  },
  shouldAttemptEagerTransition() {
    return false;
  },
  trackSchedulerEvent() {},
  resolveEventType() {
    return null;
  },
  resolveEventTimeStamp() {
    return Date.now();
  },
  maySuspendCommit() {
    return false;
  },
  preloadInstance() {
    return false;
  },
  startSuspendingCommit() {},
  suspendInstance() {},
  waitForCommitToBeReady() {
    return null;
  },
};

const reconciler: ReturnType<typeof Reconciler> = Reconciler(hostConfig);

export { reconciler };
