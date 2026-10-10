import { Head } from '@inertiajs/react';
import AppLayout from '@/components/layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusBadge } from '@/components/common/status-badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mail, Phone, Calendar, Clock, Shield, Laptop } from 'lucide-react';
import { User } from '@/types';
import { EmptyState } from '@/components/common/empty-state';

interface ShowProps {
    employee: User;
}

export default function EmployeeShow({ employee }: ShowProps) {
    const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

    return (
        <AppLayout
            title={`${employee.name} - Profile`}
            breadcrumbs={[
                { label: 'Dashboard', href: route('admin.dashboard') },
                { label: 'Employees', href: route('employees.index') },
                { label: employee.name }
            ]}
        >
            <Head title={`${employee.name} - Profile`} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Profile Header Card */}
                <Card className="md:col-span-1">
                    <CardContent className="pt-6 flex flex-col items-center text-center">
                        <Avatar className="h-24 w-24 mb-4 border-2 border-border shadow-sm">
                            <AvatarImage src={employee.avatar_url ?? undefined} />
                            <AvatarFallback className="text-xl">{getInitials(employee.name)}</AvatarFallback>
                        </Avatar>
                        <h2 className="text-xl font-bold tracking-tight">{employee.name}</h2>
                        <p className="text-sm text-muted-foreground mb-4">{employee.email}</p>
                        
                        <div className="flex items-center gap-2 mb-6">
                            <Badge variant="outline" className="capitalize">
                                {employee.role?.replace('_', ' ')}
                            </Badge>
                            <StatusBadge type="user" status={employee.status as any} />
                        </div>
                        
                        <div className="w-full space-y-3 pt-4 border-t border-border/50 text-sm">
                            <div className="flex items-center justify-between text-muted-foreground">
                                <span className="flex items-center gap-2"><Mail className="h-4 w-4" /> Email</span>
                                <span className="text-foreground truncate max-w-[150px]" title={employee.email}>{employee.email}</span>
                            </div>
                            <div className="flex items-center justify-between text-muted-foreground">
                                <span className="flex items-center gap-2"><Phone className="h-4 w-4" /> Phone</span>
                                <span className="text-foreground">{employee.phone || '-'}</span>
                            </div>
                            <div className="flex items-center justify-between text-muted-foreground">
                                <span className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Joined</span>
                                <span className="text-foreground">
                                    {employee.created_at ? new Date(employee.created_at).toLocaleDateString() : '-'}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabs Area */}
                <div className="md:col-span-2">
                    <Tabs defaultValue="details" className="w-full">
                        <TabsList className="mb-4">
                            <TabsTrigger value="details">Details</TabsTrigger>
                            <TabsTrigger value="activity">Activity</TabsTrigger>
                            <TabsTrigger value="sessions">Sessions</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="details">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Account Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                                            <p className="text-sm">{employee.name}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-muted-foreground">Email Address</p>
                                            <p className="text-sm">{employee.email}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
                                            <p className="text-sm">{employee.phone || 'Not provided'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-muted-foreground">Role</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Shield className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm capitalize">{employee.role?.replace('_', ' ')}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-muted-foreground">Status</p>
                                            <div className="mt-1">
                                                <StatusBadge type="user" status={employee.status as any} />
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-muted-foreground">Account Created</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Clock className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm">
                                                    {employee.created_at ? new Date(employee.created_at).toLocaleString() : '-'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                        
                        <TabsContent value="activity">
                            <Card>
                                <CardContent className="pt-10 pb-12">
                                    <EmptyState 
                                        icon={Clock}
                                        title="No recent activity" 
                                        description="Activity audit logging has not been implemented yet or this user has no recent actions." 
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="sessions">
                            <Card>
                                <CardContent className="pt-10 pb-12">
                                    <EmptyState 
                                        icon={Laptop}
                                        title="No active sessions" 
                                        description="Session management UI is not yet available." 
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </AppLayout>
    );
}
