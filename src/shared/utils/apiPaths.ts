export const API_PATHS = {
  AUTH:{
    REGISTER:"/api/auth/register", // Name, Email, Password and Invitation Token required. Return Admin or Auth Token
    LOGIN:"/api/auth/login", // Email and Password required. Return Admin or Auth Token
    LOGOUT:"/api/auth/logout", // Endpoint to delete the cookie on the server
    GET_PROFILE:"/api/auth/profile", // Auth Token required 
    GET_TOKEN:(type:string)=>`/api/auth/invite-token?role=${type}`, // Admin Token required
  },

  USERS:{
    GET_ALL_USERS:"/api/users", // Owner Token required
    GET_MEMBERS:"/api/users/members", // Admin Token required
    GET_USER_BY_ID:(userId:string) => `/api/users/${userId}`, // Auth Token required
    UPDATE_USER:(userId:string) => `/api/users/${userId}`, // Auth Token required
    DELETE_USER:(userId:string) => `/api/users/${userId}`, // Admin Token required
    UPDATE_ROLE:(userId:string)=>`/api/users/${userId}/role`, // Admin Token required
  },

  SESSIONS:{
    GET_USER_SESSIONS:"/api/sessions", // Admin Token required
    UPDATE_SESSION:(sessionId:string)=>`/api/sessions/${sessionId}`, // Admin Token required
    DELETE_SESSION:(sessionId:string)=>`/api/sessions/${sessionId}`, // Owner Token required
    EMPTY_WEEK:`/api/sessions/week`, // Owner Token required 
  },

  CATEGORIES:{
    GET_CATEGORIES_BY_TYPE:"/api/categories", // Auth Token required
    CREATE_CATEGORY:"/api/categories", // Admin Token required
    UPDATE_CATEGORY:(categoryId:string)=>`/api/categories/${categoryId}`, // Admin Token required
    DELETE_CATEGORY:(categoryId:string)=>`/api/categories/${categoryId}`, // Owner Token required
  },

  REPORTS:{
    GET_ALL_REPORTS:"/api/reports", // Auth Token required. Filter Admin, owner all and User only created
    CREATE_REPORT:"/api/reports", // Auth Token required
    UPDATE_REPORT:(reportId:string)=>`/api/reports/${reportId}`, // Auth Token required
    DELETE_REPORT:(reportId:string)=>`/api/reports/${reportId}`, // Auth Token required
  },

  DESKS:{
    CREATE_DESK:"/api/desks", // Admin Token required
    GET_ALL_DESKS:"/api/desks", // Auth Token required
    GET_DESK:(deskId:string) => `/api/desks/${deskId}`, // Auth Token required
    UPDATE_DESK:(deskId:string) => `/api/desks/${deskId}`, // Admin Token required
    DELETE_DESK:(deskId:string) => `/api/desks/${deskId}`, // Admin Token required
    EXIT_DESK:"/api/desks/exit",
    GET_MEMBERS:"/api/desks/members",
  },

  FOLDERS:{
    CREATE_FOLDER:"/api/folders", // Admin Token required
    GET_ALL_FOLDERS:"/api/folders", // Auth Token required
    GET_FOLDER:(folderId:string) => `/api/folders/${folderId}`, // Auth Token required
    UPDATE_FOLDER:(folderId:string) => `/api/folders/${folderId}`, // Admin Token required
    DELETE_FOLDER:(folderId:string) => `/api/folders/${folderId}`, // Admin Token required
  },

  DASHBOARD:{
    GET_TASKS_DATA:"/api/dashboard/tasks", // Auth Token required
    GET_ACCOUNTS_DATA:"/api/dashboard/accounts", // Auth Token required
    GET_EVENTS_DATA:"/api/dashboard/events", // Auth Token required
  },

  TASKS:{
    GET_ALL_TASKS:"/api/tasks", // Auth Token required. Filter Admin (all) and User (assigned)
    GET_TASK_BY_ID:(taskId:string) => `/api/tasks/${taskId}`, // Auth Token required
    CREATE_TASK:"/api/tasks", // Admin Token required
    UPDATE_TASK:(taskId:string) => `/api/tasks/${taskId}`, // Auth Token required
    UPDATE_TODO_CHECKLIST:(taskId:string) => `/api/tasks/${taskId}/todo`, // Auth Token required
    APPROVE_TASK:(taskId:string) => `/api/tasks/${taskId}/approve`,
    DELETE_TASK:(taskId:string) => `/api/tasks/${taskId}`, // Admin Token required
  },

  ACCOUNTS:{
    GET_ALL_ACCOUNTS:"/api/accounts", // Auth Token required. Filter Admin (all) and User (assigned)
    GET_ACCOUNT_BY_ID:(accountId:string) => `/api/accounts/${accountId}`, // Auth Token required
    CREATE_ACCOUNT:"/api/accounts", // Admin Token required
    UPDATE_ACCOUNT:(accountId:string) => `/api/accounts/${accountId}`, // Auth Token required
    DELETE_ACCOUNT:(accountId:string) => `/api/accounts/${accountId}`, // Admin Token required
    CREATE_TRANSACTION:`/api/accounts/transactions`, // Admin Token required
    UPDATE_TRANSACTION:(transactionId:string) => `/api/accounts/transactions/${transactionId}`, // Admin Token required
    DELETE_TRANSACTION:(transactionId:string) => `/api/accounts/transactions/${transactionId}`, // Admin Token required
  },

  PRODUCTS:{
    GET_ALL_PRODUCTS:"/api/products", // Auth Token required. Filter Owner all, Admin, User, client assigned
    GET_PRODUCT_BY_ID:(productId:string) => `/api/products/${productId}`, // Auth Token required
    CREATE_PRODUCT:"/api/products", // Admin Token required
    UPDATE_PRODUCT:(productId:string) => `/api/products/${productId}`, // Admin Token required
    DELETE_PRODUCT:(productId:string) => `/api/products/${productId}`, // Owner Token required
    CREATE_MOVEMENT:`/api/products/movements`, // Admin Token required
    UPDATE_MOVEMENT:(movementId:string) => `/api/products/movements/${movementId}`, // Admin Token required
    DELETE_MOVEMENT:(movementId:string) => `/api/products/movements/${movementId}`, // Admin Token required
  },

  INVENTORIES:{
    GET_ALL_INVENTORIES:"/api/inventories", // Auth Token required. Filter Owner all, Admin, User, client assigned
    GET_INVENTORY_BY_ID:(inventoryId:string) => `/api/inventories/${inventoryId}`, // Auth Token required
    CREATE_INVENTORY:"/api/inventories", // Admin Token required
    UPDATE_INVENTORY:(inventoryId:string) => `/api/inventories/${inventoryId}`, // Admin Token required
    DELETE_INVENTORY:(inventoryId:string) => `/api/inventories/${inventoryId}`, // Owner Token required
    ITEMS:{
      GET_ALL_ITEMS:"/api/inventories/items", // Auth Token required
      GET_ITEM_BY_ID:(itemId:string) => `/api/inventories/items/${itemId}`, // Auth Token required
      CREATE_ITEM:"/api/inventories/items", // Admin Token required
      UPDATE_ITEM:(itemId:string) => `/api/inventories/items/${itemId}`, // Admin Token required
      DELETE_ITEM:(itemId:string) => `/api/inventories/items/${itemId}`, // Owner Token required
      UPDATE_STOCK:(itemId:string) => `/api/inventories/items/${itemId}/stock`, // Admin Token required
    },
  },

  EVENTS:{
    GET_ALL_EVENTS:"/api/events", // Auth Token required. Filter Admin (all) and User (assigned)
    GET_EVENT_BY_ID:(eventId:string) => `/api/events/${eventId}`, // Auth Token required
    CREATE_EVENT:"/api/events", // Admin Token required
    UPDATE_EVENT:(eventId:string) => `/api/events/${eventId}`, // Auth Token required
    DELETE_EVENT:(eventId:string) => `/api/events/${eventId}`, // Admin Token required
  },

  GOALS:{
    GET_ALL_GOALS:"/api/goals", // Auth Token required. Filter Admin (all) and User (assigned)
    GET_GOAL_BY_ID:(goalId:string) => `/api/goals/${goalId}`, // Auth Token required
    CREATE_GOAL:"/api/goals", // Admin Token required
    UPDATE_GOAL:(goalId:string) => `/api/goals/${goalId}`, // Auth Token required
    UPDATE_OBJECTIVES:(goalId:string) => `/api/goals/${goalId}/objectives`, // Auth Token required
    DELETE_GOAL:(goalId:string) => `/api/goals/${goalId}`, // Admin Token required
  },

  STORE:{
    CONFIRM_SALE:"/api/store"
  },
};
