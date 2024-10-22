/* prettier-ignore-start */

/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file is auto-generated by TanStack Router

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as CatalogImport } from './routes/catalog'
import { Route as AdminImport } from './routes/admin'
import { Route as IndexImport } from './routes/index'
import { Route as ResourceGroupVersionPluralSystemNamespaceNameImport } from './routes/resource.$group.$version.$plural.$system.$namespace.$name'

// Create/Update Routes

const CatalogRoute = CatalogImport.update({
  id: '/catalog',
  path: '/catalog',
  getParentRoute: () => rootRoute,
} as any)

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

const ResourceGroupVersionPluralSystemNamespaceNameRoute =
  ResourceGroupVersionPluralSystemNamespaceNameImport.update({
    id: '/resource/$group/$version/$plural/$system/$namespace/$name',
    path: '/resource/$group/$version/$plural/$system/$namespace/$name',
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
    '/catalog': {
      id: '/catalog'
      path: '/catalog'
      fullPath: '/catalog'
      preLoaderRoute: typeof CatalogImport
      parentRoute: typeof rootRoute
    }
    '/resource/$group/$version/$plural/$system/$namespace/$name': {
      id: '/resource/$group/$version/$plural/$system/$namespace/$name'
      path: '/resource/$group/$version/$plural/$system/$namespace/$name'
      fullPath: '/resource/$group/$version/$plural/$system/$namespace/$name'
      preLoaderRoute: typeof ResourceGroupVersionPluralSystemNamespaceNameImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/admin': typeof AdminRoute
  '/catalog': typeof CatalogRoute
  '/resource/$group/$version/$plural/$system/$namespace/$name': typeof ResourceGroupVersionPluralSystemNamespaceNameRoute
}

export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/admin': typeof AdminRoute
  '/catalog': typeof CatalogRoute
  '/resource/$group/$version/$plural/$system/$namespace/$name': typeof ResourceGroupVersionPluralSystemNamespaceNameRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/': typeof IndexRoute
  '/admin': typeof AdminRoute
  '/catalog': typeof CatalogRoute
  '/resource/$group/$version/$plural/$system/$namespace/$name': typeof ResourceGroupVersionPluralSystemNamespaceNameRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | '/'
    | '/admin'
    | '/catalog'
    | '/resource/$group/$version/$plural/$system/$namespace/$name'
  fileRoutesByTo: FileRoutesByTo
  to:
    | '/'
    | '/admin'
    | '/catalog'
    | '/resource/$group/$version/$plural/$system/$namespace/$name'
  id:
    | '__root__'
    | '/'
    | '/admin'
    | '/catalog'
    | '/resource/$group/$version/$plural/$system/$namespace/$name'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  AdminRoute: typeof AdminRoute
  CatalogRoute: typeof CatalogRoute
  ResourceGroupVersionPluralSystemNamespaceNameRoute: typeof ResourceGroupVersionPluralSystemNamespaceNameRoute
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  AdminRoute: AdminRoute,
  CatalogRoute: CatalogRoute,
  ResourceGroupVersionPluralSystemNamespaceNameRoute:
    ResourceGroupVersionPluralSystemNamespaceNameRoute,
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
        "/catalog",
        "/resource/$group/$version/$plural/$system/$namespace/$name"
      ]
    },
    "/": {
      "filePath": "index.tsx"
    },
    "/admin": {
      "filePath": "admin.tsx"
    },
    "/catalog": {
      "filePath": "catalog.tsx"
    },
    "/resource/$group/$version/$plural/$system/$namespace/$name": {
      "filePath": "resource.$group.$version.$plural.$system.$namespace.$name.tsx"
    }
  }
}
ROUTE_MANIFEST_END */
