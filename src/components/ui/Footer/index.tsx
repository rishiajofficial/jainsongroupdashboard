
import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Users, Map, BarChart4, Building, UserCheck } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-background border-t border-border py-8 mt-auto">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">For Candidates</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/jobs" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  <span>Browse Jobs</span>
                </Link>
              </li>
              <li>
                <Link to="/applications" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                  <UserCheck className="h-4 w-4" />
                  <span>My Applications</span>
                </Link>
              </li>
              <li>
                <Link to="/assessments/candidate" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                  <UserCheck className="h-4 w-4" />
                  <span>My Assessments</span>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">For Salespeople</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/salesperson-tracker" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                  <Map className="h-4 w-4" />
                  <span>Record Shop Visits</span>
                </Link>
              </li>
              <li>
                <Link to="/salesperson-stats" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                  <BarChart4 className="h-4 w-4" />
                  <span>View Statistics</span>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">For Managers</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/applications/review" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                  <UserCheck className="h-4 w-4" />
                  <span>Review Applications</span>
                </Link>
              </li>
              <li>
                <Link to="/jobs/manage" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  <span>Manage Jobs</span>
                </Link>
              </li>
              <li>
                <Link to="/salesperson-dashboard" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>Salesperson Dashboard</span>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <Link to="/candidates" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>For Candidates</span>
                </Link>
              </li>
              <li>
                <Link to="/employers" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  <span>For Employers</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-border text-center text-muted-foreground">
          <p>© {new Date().getFullYear()} HiringDash. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
