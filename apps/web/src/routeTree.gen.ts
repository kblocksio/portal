/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as AdminImport } from './routes/admin'
import { Route as IndexImport } from './routes/index'
import { Route as ResourcesIndexImport } from './routes/resources.index'
import { Route as OrganizationsIndexImport } from './routes/organizations.index'
import { Route as ClustersIndexImport } from './routes/clusters.index'
import { Route as CatalogIndexImport } from './routes/catalog.index'
import { Route as ProjectsNameImport } from './routes/projects.$name'
import { Route as ResourcesNewIndexImport } from './routes/resources.new.index'
import { Route as CatalogGroupVersionPluralImport } from './routes/catalog.$group.$version.$plural'
import { Route as ResourcesNewGroupVersionPluralImport } from './routes/resources.new.$group.$version.$plural'
import { Route as ResourcesGroupVersionPluralSystemNamespaceNameImport } from './routes/resources.$group.$version.$plural.$system.$namespace.$name'
import { Route as ResourcesEditGroupVersionPluralSystemNamespaceNameImport } from './routes/resources.edit.$group.$version.$plural.$system.$namespace.$name'

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

const OrganizationsIndexRoute = OrganizationsIndexImport.update({
  id: '/organizations/',
  path: '/organizations/',
  getParentRoute: () => rootRoute,
} as any)

const ClustersIndexRoute = ClustersIndexImport.update({
  id: '/clusters/',
  path: '/clusters/',
  getParentRoute: () => rootRoute,
} as any)

const CatalogIndexRoute = CatalogIndexImport.update({
  id: '/catalog/',
  path: '/catalog/',
  getParentRoute: () => rootRoute,
} as any)

const ProjectsNameRoute = ProjectsNameImport.update({
  id: '/projects/$name',
  path: '/projects/$name',
  getParentRoute: () => rootRoute,
} as any)

const ResourcesNewIndexRoute = ResourcesNewIndexImport.update({
  id: '/resources/new/',
  path: '/resources/new/',
  getParentRoute: () => rootRoute,
} as any)

const CatalogGroupVersionPluralRoute = CatalogGroupVersionPluralImport.update({
  id: '/catalog/$group/$version/$plural',
  path: '/catalog/$group/$version/$plural',
  getParentRoute: () => rootRoute,
} as any)

const ResourcesNewGroupVersionPluralRoute =
  ResourcesNewGroupVersionPluralImport.update({
    id: '/resources/new/$group/$version/$plural',
    path: '/resources/new/$group/$version/$plural',
    getParentRoute: () => rootRoute,
  } as any)

const ResourcesGroupVersionPluralSystemNamespaceNameRoute =
  ResourcesGroupVersionPluralSystemNamespaceNameImport.update({
    id: '/resources/$group/$version/$plural/$system/$namespace/$name',
    path: '/resources/$group/$version/$plural/$system/$namespace/$name',
    getParentRoute: () => rootRoute,
  } as any)

const ResourcesEditGroupVersionPluralSystemNamespaceNameRoute =
  ResourcesEditGroupVersionPluralSystemNamespaceNameImport.update({
    id: '/resources/edit/$group/$version/$plural/$system/$namespace/$name',
    path: '/resources/edit/$group/$version/$plural/$system/$namespace/$name',
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
    '/projects/$name': {
      id: '/projects/$name'
      path: '/projects/$name'
      fullPath: '/projects/$name'
      preLoaderRoute: typeof ProjectsNameImport
      parentRoute: typeof rootRoute
    }
    '/catalog/': {
      id: '/catalog/'
      path: '/catalog'
      fullPath: '/catalog'
      preLoaderRoute: typeof CatalogIndexImport
      parentRoute: typeof rootRoute
    }
    '/clusters/': {
      id: '/clusters/'
      path: '/clusters'
      fullPath: '/clusters'
      preLoaderRoute: typeof ClustersIndexImport
      parentRoute: typeof rootRoute
    }
    '/organizations/': {
      id: '/organizations/'
      path: '/organizations'
      fullPath: '/organizations'
      preLoaderRoute: typeof OrganizationsIndexImport
      parentRoute: typeof rootRoute
    }
    '/resources/': {
      id: '/resources/'
      path: '/resources'
      fullPath: '/resources'
      preLoaderRoute: typeof ResourcesIndexImport
      parentRoute: typeof rootRoute
    }
    '/resources/new/': {
      id: '/resources/new/'
      path: '/resources/new'
      fullPath: '/resources/new'
      preLoaderRoute: typeof ResourcesNewIndexImport
      parentRoute: typeof rootRoute
    }
    '/catalog/$group/$version/$plural': {
      id: '/catalog/$group/$version/$plural'
      path: '/catalog/$group/$version/$plural'
      fullPath: '/catalog/$group/$version/$plural'
      preLoaderRoute: typeof CatalogGroupVersionPluralImport
      parentRoute: typeof rootRoute
    }
    '/resources/new/$group/$version/$plural': {
      id: '/resources/new/$group/$version/$plural'
      path: '/resources/new/$group/$version/$plural'
      fullPath: '/resources/new/$group/$version/$plural'
      preLoaderRoute: typeof ResourcesNewGroupVersionPluralImport
      parentRoute: typeof rootRoute
    }
    '/resources/$group/$version/$plural/$system/$namespace/$name': {
      id: '/resources/$group/$version/$plural/$system/$namespace/$name'
      path: '/resources/$group/$version/$plural/$system/$namespace/$name'
      fullPath: '/resources/$group/$version/$plural/$system/$namespace/$name'
      preLoaderRoute: typeof ResourcesGroupVersionPluralSystemNamespaceNameImport
      parentRoute: typeof rootRoute
    }
    '/resources/edit/$group/$version/$plural/$system/$namespace/$name': {
      id: '/resources/edit/$group/$version/$plural/$system/$namespace/$name'
      path: '/resources/edit/$group/$version/$plural/$system/$namespace/$name'
      fullPath: '/resources/edit/$group/$version/$plural/$system/$namespace/$name'
      preLoaderRoute: typeof ResourcesEditGroupVersionPluralSystemNamespaceNameImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/admin': typeof AdminRoute
  '/projects/$name': typeof ProjectsNameRoute
  '/catalog': typeof CatalogIndexRoute
  '/clusters': typeof ClustersIndexRoute
  '/organizations': typeof OrganizationsIndexRoute
  '/resources': typeof ResourcesIndexRoute
  '/resources/new': typeof ResourcesNewIndexRoute
  '/catalog/$group/$version/$plural': typeof CatalogGroupVersionPluralRoute
  '/resources/new/$group/$version/$plural': typeof ResourcesNewGroupVersionPluralRoute
  '/resources/$group/$version/$plural/$system/$namespace/$name': typeof ResourcesGroupVersionPluralSystemNamespaceNameRoute
  '/resources/edit/$group/$version/$plural/$system/$namespace/$name': typeof ResourcesEditGroupVersionPluralSystemNamespaceNameRoute
}

export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/admin': typeof AdminRoute
  '/projects/$name': typeof ProjectsNameRoute
  '/catalog': typeof CatalogIndexRoute
  '/clusters': typeof ClustersIndexRoute
  '/organizations': typeof OrganizationsIndexRoute
  '/resources': typeof ResourcesIndexRoute
  '/resources/new': typeof ResourcesNewIndexRoute
  '/catalog/$group/$version/$plural': typeof CatalogGroupVersionPluralRoute
  '/resources/new/$group/$version/$plural': typeof ResourcesNewGroupVersionPluralRoute
  '/resources/$group/$version/$plural/$system/$namespace/$name': typeof ResourcesGroupVersionPluralSystemNamespaceNameRoute
  '/resources/edit/$group/$version/$plural/$system/$namespace/$name': typeof ResourcesEditGroupVersionPluralSystemNamespaceNameRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/': typeof IndexRoute
  '/admin': typeof AdminRoute
  '/projects/$name': typeof ProjectsNameRoute
  '/catalog/': typeof CatalogIndexRoute
  '/clusters/': typeof ClustersIndexRoute
  '/organizations/': typeof OrganizationsIndexRoute
  '/resources/': typeof ResourcesIndexRoute
  '/resources/new/': typeof ResourcesNewIndexRoute
  '/catalog/$group/$version/$plural': typeof CatalogGroupVersionPluralRoute
  '/resources/new/$group/$version/$plural': typeof ResourcesNewGroupVersionPluralRoute
  '/resources/$group/$version/$plural/$system/$namespace/$name': typeof ResourcesGroupVersionPluralSystemNamespaceNameRoute
  '/resources/edit/$group/$version/$plural/$system/$namespace/$name': typeof ResourcesEditGroupVersionPluralSystemNamespaceNameRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | '/'
    | '/admin'
    | '/projects/$name'
    | '/catalog'
    | '/clusters'
    | '/organizations'
    | '/resources'
    | '/resources/new'
    | '/catalog/$group/$version/$plural'
    | '/resources/new/$group/$version/$plural'
    | '/resources/$group/$version/$plural/$system/$namespace/$name'
    | '/resources/edit/$group/$version/$plural/$system/$namespace/$name'
  fileRoutesByTo: FileRoutesByTo
  to:
    | '/'
    | '/admin'
    | '/projects/$name'
    | '/catalog'
    | '/clusters'
    | '/organizations'
    | '/resources'
    | '/resources/new'
    | '/catalog/$group/$version/$plural'
    | '/resources/new/$group/$version/$plural'
    | '/resources/$group/$version/$plural/$system/$namespace/$name'
    | '/resources/edit/$group/$version/$plural/$system/$namespace/$name'
  id:
    | '__root__'
    | '/'
    | '/admin'
    | '/projects/$name'
    | '/catalog/'
    | '/clusters/'
    | '/organizations/'
    | '/resources/'
    | '/resources/new/'
    | '/catalog/$group/$version/$plural'
    | '/resources/new/$group/$version/$plural'
    | '/resources/$group/$version/$plural/$system/$namespace/$name'
    | '/resources/edit/$group/$version/$plural/$system/$namespace/$name'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  AdminRoute: typeof AdminRoute
  ProjectsNameRoute: typeof ProjectsNameRoute
  CatalogIndexRoute: typeof CatalogIndexRoute
  ClustersIndexRoute: typeof ClustersIndexRoute
  OrganizationsIndexRoute: typeof OrganizationsIndexRoute
  ResourcesIndexRoute: typeof ResourcesIndexRoute
  ResourcesNewIndexRoute: typeof ResourcesNewIndexRoute
  CatalogGroupVersionPluralRoute: typeof CatalogGroupVersionPluralRoute
  ResourcesNewGroupVersionPluralRoute: typeof ResourcesNewGroupVersionPluralRoute
  ResourcesGroupVersionPluralSystemNamespaceNameRoute: typeof ResourcesGroupVersionPluralSystemNamespaceNameRoute
  ResourcesEditGroupVersionPluralSystemNamespaceNameRoute: typeof ResourcesEditGroupVersionPluralSystemNamespaceNameRoute
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  AdminRoute: AdminRoute,
  ProjectsNameRoute: ProjectsNameRoute,
  CatalogIndexRoute: CatalogIndexRoute,
  ClustersIndexRoute: ClustersIndexRoute,
  OrganizationsIndexRoute: OrganizationsIndexRoute,
  ResourcesIndexRoute: ResourcesIndexRoute,
  ResourcesNewIndexRoute: ResourcesNewIndexRoute,
  CatalogGroupVersionPluralRoute: CatalogGroupVersionPluralRoute,
  ResourcesNewGroupVersionPluralRoute: ResourcesNewGroupVersionPluralRoute,
  ResourcesGroupVersionPluralSystemNamespaceNameRoute:
    ResourcesGroupVersionPluralSystemNamespaceNameRoute,
  ResourcesEditGroupVersionPluralSystemNamespaceNameRoute:
    ResourcesEditGroupVersionPluralSystemNamespaceNameRoute,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/admin",
        "/projects/$name",
        "/catalog/",
        "/clusters/",
        "/organizations/",
        "/resources/",
        "/resources/new/",
        "/catalog/$group/$version/$plural",
        "/resources/new/$group/$version/$plural",
        "/resources/$group/$version/$plural/$system/$namespace/$name",
        "/resources/edit/$group/$version/$plural/$system/$namespace/$name"
      ]
    },
    "/": {
      "filePath": "index.tsx"
    },
    "/admin": {
      "filePath": "admin.tsx"
    },
    "/projects/$name": {
      "filePath": "projects.$name.tsx"
    },
    "/catalog/": {
      "filePath": "catalog.index.tsx"
    },
    "/clusters/": {
      "filePath": "clusters.index.tsx"
    },
    "/organizations/": {
      "filePath": "organizations.index.tsx"
    },
    "/resources/": {
      "filePath": "resources.index.tsx"
    },
    "/resources/new/": {
      "filePath": "resources.new.index.tsx"
    },
    "/catalog/$group/$version/$plural": {
      "filePath": "catalog.$group.$version.$plural.tsx"
    },
    "/resources/new/$group/$version/$plural": {
      "filePath": "resources.new.$group.$version.$plural.tsx"
    },
    "/resources/$group/$version/$plural/$system/$namespace/$name": {
      "filePath": "resources.$group.$version.$plural.$system.$namespace.$name.tsx"
    },
    "/resources/edit/$group/$version/$plural/$system/$namespace/$name": {
      "filePath": "resources.edit.$group.$version.$plural.$system.$namespace.$name.tsx"
    }
  }
}
ROUTE_MANIFEST_END */
