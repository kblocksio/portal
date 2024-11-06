/* prettier-ignore-start */

/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file is auto-generated by TanStack Router

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as AdminImport } from './routes/admin'
import { Route as IndexImport } from './routes/index'
import { Route as ResourcesIndexImport } from './routes/resources.index'
import { Route as CatalogIndexImport } from './routes/catalog.index'
import { Route as CatalogGroupVersionKindImport } from './routes/catalog.$group.$version.$kind'
import { Route as ResourcesGroupVersionPluralSystemNamespaceNameImport } from './routes/resources.$group.$version.$plural.$system.$namespace.$name'

// Create/Update Routes

const AdminRoute = AdminImport.update({
  id: '/admin',
  path: '/admin',
  getParentRoute: () => rootRoute,
} as any)

const IndexRoute = IndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRoute,
} as any)

const ResourcesIndexRoute = ResourcesIndexImport.update({
  id: '/resources/',
  path: '/resources/',
  getParentRoute: () => rootRoute,
} as any)

const CatalogIndexRoute = CatalogIndexImport.update({
  id: '/catalog/',
  path: '/catalog/',
  getParentRoute: () => rootRoute,
} as any)

const CatalogGroupVersionKindRoute = CatalogGroupVersionKindImport.update({
  id: '/catalog/$group/$version/$kind',
  path: '/catalog/$group/$version/$kind',
  getParentRoute: () => rootRoute,
} as any)

const ResourcesGroupVersionPluralSystemNamespaceNameRoute =
  ResourcesGroupVersionPluralSystemNamespaceNameImport.update({
    id: '/resources/$group/$version/$plural/$system/$namespace/$name',
    path: '/resources/$group/$version/$plural/$system/$namespace/$name',
    getParentRoute: () => rootRoute,
  } as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexImport
      parentRoute: typeof rootRoute
    }
    '/admin': {
      id: '/admin'
      path: '/admin'
      fullPath: '/admin'
      preLoaderRoute: typeof AdminImport
      parentRoute: typeof rootRoute
    }
    '/catalog/': {
      id: '/catalog/'
      path: '/catalog'
      fullPath: '/catalog'
      preLoaderRoute: typeof CatalogIndexImport
      parentRoute: typeof rootRoute
    }
    '/resources/': {
      id: '/resources/'
      path: '/resources'
      fullPath: '/resources'
      preLoaderRoute: typeof ResourcesIndexImport
      parentRoute: typeof rootRoute
    }
    '/catalog/$group/$version/$kind': {
      id: '/catalog/$group/$version/$kind'
      path: '/catalog/$group/$version/$kind'
      fullPath: '/catalog/$group/$version/$kind'
      preLoaderRoute: typeof CatalogGroupVersionKindImport
      parentRoute: typeof rootRoute
    }
    '/resources/$group/$version/$plural/$system/$namespace/$name': {
      id: '/resources/$group/$version/$plural/$system/$namespace/$name'
      path: '/resources/$group/$version/$plural/$system/$namespace/$name'
      fullPath: '/resources/$group/$version/$plural/$system/$namespace/$name'
      preLoaderRoute: typeof ResourcesGroupVersionPluralSystemNamespaceNameImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/admin': typeof AdminRoute
  '/catalog': typeof CatalogIndexRoute
  '/resources': typeof ResourcesIndexRoute
  '/catalog/$group/$version/$kind': typeof CatalogGroupVersionKindRoute
  '/resources/$group/$version/$plural/$system/$namespace/$name': typeof ResourcesGroupVersionPluralSystemNamespaceNameRoute
}

export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/admin': typeof AdminRoute
  '/catalog': typeof CatalogIndexRoute
  '/resources': typeof ResourcesIndexRoute
  '/catalog/$group/$version/$kind': typeof CatalogGroupVersionKindRoute
  '/resources/$group/$version/$plural/$system/$namespace/$name': typeof ResourcesGroupVersionPluralSystemNamespaceNameRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/': typeof IndexRoute
  '/admin': typeof AdminRoute
  '/catalog/': typeof CatalogIndexRoute
  '/resources/': typeof ResourcesIndexRoute
  '/catalog/$group/$version/$kind': typeof CatalogGroupVersionKindRoute
  '/resources/$group/$version/$plural/$system/$namespace/$name': typeof ResourcesGroupVersionPluralSystemNamespaceNameRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | '/'
    | '/admin'
    | '/catalog'
    | '/resources'
    | '/catalog/$group/$version/$kind'
    | '/resources/$group/$version/$plural/$system/$namespace/$name'
  fileRoutesByTo: FileRoutesByTo
  to:
    | '/'
    | '/admin'
    | '/catalog'
    | '/resources'
    | '/catalog/$group/$version/$kind'
    | '/resources/$group/$version/$plural/$system/$namespace/$name'
  id:
    | '__root__'
    | '/'
    | '/admin'
    | '/catalog/'
    | '/resources/'
    | '/catalog/$group/$version/$kind'
    | '/resources/$group/$version/$plural/$system/$namespace/$name'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  AdminRoute: typeof AdminRoute
  CatalogIndexRoute: typeof CatalogIndexRoute
  ResourcesIndexRoute: typeof ResourcesIndexRoute
  CatalogGroupVersionKindRoute: typeof CatalogGroupVersionKindRoute
  ResourcesGroupVersionPluralSystemNamespaceNameRoute: typeof ResourcesGroupVersionPluralSystemNamespaceNameRoute
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  AdminRoute: AdminRoute,
  CatalogIndexRoute: CatalogIndexRoute,
  ResourcesIndexRoute: ResourcesIndexRoute,
  CatalogGroupVersionKindRoute: CatalogGroupVersionKindRoute,
  ResourcesGroupVersionPluralSystemNamespaceNameRoute:
    ResourcesGroupVersionPluralSystemNamespaceNameRoute,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* prettier-ignore-end */

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/admin",
        "/catalog/",
        "/resources/",
        "/catalog/$group/$version/$kind",
        "/resources/$group/$version/$plural/$system/$namespace/$name"
      ]
    },
    "/": {
      "filePath": "index.tsx"
    },
    "/admin": {
      "filePath": "admin.tsx"
    },
    "/catalog/": {
      "filePath": "catalog.index.tsx"
    },
    "/resources/": {
      "filePath": "resources.index.tsx"
    },
    "/catalog/$group/$version/$kind": {
      "filePath": "catalog.$group.$version.$kind.tsx"
    },
    "/resources/$group/$version/$plural/$system/$namespace/$name": {
      "filePath": "resources.$group.$version.$plural.$system.$namespace.$name.tsx"
    }
  }
}
ROUTE_MANIFEST_END */
