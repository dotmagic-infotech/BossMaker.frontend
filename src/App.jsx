// React Imports
import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';


import Loader from './components/Common/Loader';
import MainLoader from './components/Common/MainLoader';
import PermissionRoute from './components/layouts/PermissionRoute';
import Participant from './pages/Participant/Participant';
import AddParticipant from './pages/Participant/AddParticipant';
import StudentCourses from './pages/StudentCourses/StudentCourses';

// Custom Component
const MainLayout = React.lazy(() => import('./components/layouts/MainLayout'));
const ProtectedRoute = React.lazy(() => import('./components/layouts/ProtectedRoute'));
const AccessDenied = React.lazy(() => import('./pages/AccessDenied'));

// Login and SignUp
const SignIn = React.lazy(() => import('./pages/Login/SignIn'));
const SignUp = React.lazy(() => import('./pages/Login/SignUp'));

// Dashboard
const Dashboard = React.lazy(() => import('./pages/Dashboard'));

// Category
const Category = React.lazy(() => import('./pages/Category/Category'));

// Role User
const RoleUser = React.lazy(() => import('./pages/RoleUser/RoleUser'));
const AddRoleUser = React.lazy(() => import('./pages/RoleUser/AddRoleUser'));
const Permission = React.lazy(() => import('./pages/RoleUser/Permission'));

// Course
const Course = React.lazy(() => import('./pages/Course/Course'));
const AddCourse = React.lazy(() => import('./pages/Course/AddCourse'));

// Settings
const UserProfile = React.lazy(() => import('./pages/Settings/UserProfile'));
const ChangePassword = React.lazy(() => import('./pages/Settings/ChangePassword'));

// Css
import './App.css'

function App() {
  
  return (
    <Routes>
      <Route path="/admin/signin" element={<Suspense fallback={<MainLoader />}><SignIn /></Suspense>} />
      {/* <Route path="/admin/signup" element={<Suspense fallback={<MainLoader />}><SignUp /></Suspense>} /> */}

      <Route element={<ProtectedRoute />}>
        <Route element={<Suspense fallback={<MainLoader />}><MainLayout /></Suspense>}>

          <Route path="/" element={<Suspense fallback={<MainLoader />}><Navigate to="/admin/dashboard" /></Suspense>} />
          <Route path="/admin" element={<Suspense fallback={<MainLoader />}><Navigate to="/admin/dashboard" /></Suspense>} />

          {/* Dashboard */}
          <Route path="/admin/dashboard" element={<Suspense fallback={<Loader />}><Dashboard /></Suspense>} />

          {/* Category */}
          <Route path="/admin/category" element={<Suspense fallback={<Loader />}> <PermissionRoute slug="category"><Category /></PermissionRoute></Suspense>} />

          {/* Role User */}
          <Route path="/admin/role-user" element={<Suspense fallback={<Loader />}> <PermissionRoute slug="role"><RoleUser /></PermissionRoute></Suspense>} />
          <Route path="/admin/role-user/add-role" element={<Suspense fallback={<Loader />}> <PermissionRoute slug="role" action="edit"><AddRoleUser /></PermissionRoute></Suspense>} />
          <Route path="/admin/role-user/edit-role/:id" element={<Suspense fallback={<Loader />}> <PermissionRoute slug="role" action="edit"><AddRoleUser /></PermissionRoute></Suspense>} />
          <Route path="/admin/role-user/permission/:id" element={<Suspense fallback={<Loader />}><PermissionRoute slug="role" action="edit"><Permission /></PermissionRoute></Suspense>} />

          {/* Participant Management */}
          <Route path="/admin/participant" element={<Suspense fallback={<Loader />}><PermissionRoute slug="participants"><Participant /></PermissionRoute></Suspense>} />
          <Route path="/admin/participant/add-participant" element={<Suspense fallback={<Loader />}><PermissionRoute slug="participants" action="edit"><AddParticipant /></PermissionRoute></Suspense>} />
          <Route path="/admin/participant/edit-participant/:id" element={<Suspense fallback={<Loader />}><PermissionRoute slug="participants" action="edit"><AddParticipant /></PermissionRoute></Suspense>} />

          {/* Course */}
          <Route path="/admin/course" element={<Suspense fallback={<Loader />}><PermissionRoute slug="course"><Course /></PermissionRoute></Suspense>} />
          <Route path="/admin/course/add-course" element={<Suspense fallback={<Loader />}><PermissionRoute slug="course" action="edit"><AddCourse /></PermissionRoute></Suspense>} />
          <Route path="/admin/course/edit-course/:id" element={<Suspense fallback={<Loader />}><PermissionRoute slug="course" action="edit"><AddCourse /></PermissionRoute></Suspense>} />

          {/* Courses for Students */}
          <Route path="/admin/courses" element={<Suspense fallback={<Loader />}><PermissionRoute slug="studentCourses"><StudentCourses /></PermissionRoute></Suspense>} />

          {/* Settings */}
          <Route path="/admin/profile" element={<Suspense fallback={<Loader />}><UserProfile /></Suspense>} />
          <Route path="/admin/change-password" element={<Suspense fallback={<Loader />}><ChangePassword /></Suspense>} />

          {/* Access Denied */}
          <Route path="*" element={<Suspense fallback={<Loader />}><AccessDenied /></Suspense>} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
