/*
 Copyright 2016 Google Inc. All Rights Reserved.
 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/

export const cacheBustParamName = '_sw-precaching';
export const version = 'v1';
export const dbName = 'sw-precaching';
export const dbVersion = '1';
export const dbStorename = 'asset-revisions';

let tmpRevisionedCacheName = `sw-precaching-revisioned-${version}`;
if (self && self.registration) {
  tmpRevisionedCacheName += `-${self.registration.scope}`;
}
export const defaultRevisionedCacheName = tmpRevisionedCacheName;
