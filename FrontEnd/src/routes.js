import { Navigate, createBrowserRouter } from "react-router-dom";
import Home from "./pages/Home/Home";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import App from "./App";
import JobDetails from "./pages/JobDetails/JobDetails";
import ManageJobs from "./pages/manage-jobs/ManageJobs";
import ManageUsers from "./pages/manage-users/ManageUsers";
import AddJob from "./pages/manage-jobs/AddJob";
import UpdateJob from "./pages/manage-jobs/UpdateJob";
import AddUser from "./pages/manage-users/AddUser";
import UpdateUser from "./pages/manage-users/UpdateUser";
import Client from "./middleware/Client";
import Admin from "./middleware/Admin";
import ManageRequests from "./pages/manage-requests/ManageRequests";
import RequestDetails from "./pages/RequestDetails/RequestDetails";
export const routes = createBrowserRouter(
    [   
     {
       path: "",
       element: <App />,
       children: [
       { path:"/",
       element:<Home />,
       },
       { path:":id",
       element:<JobDetails />,
       },
       
       {
        element: <Client />,
        children: [
          {
            path: "/login",
            element: <Login />,
          },
          {
            path: "/register",
            element: <Register />,
          },
        ],
      },
        {
            path: "/manage-jobs",
            element: <Admin/>,
            children: [
            { path:"",
            element:<ManageJobs/>
            },
            { path:"add",
            element:<AddJob/>
            },
            { path:":id",
            element:<UpdateJob/>
            }
                 ]
             },      
             {
              path: "/manage-users",
              element: <Admin/>,
              children: [
              { path:"",
              element:<ManageUsers/>
              },
              { path:"add",
              element:<AddUser/>
              },
              { path:":id",
              element:<UpdateUser/>
              }
                   ]
               },   
               {
                path: "/manage-requests",
                element: <Admin/>,
                children: [
                { path:"",
                element:<ManageRequests/>
                },
                { path:":id",
                element:<ManageRequests/>
                },
                { path:"/manage-requests/rev/:id",
                element:<RequestDetails/>
                },
                     ]
                 },      
            ],
        },
        
        {
            path:"*",
            element:<Navigate to={"/"}/> ,
        }
        
    ]
);