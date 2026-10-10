import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { t } from '@/lib/i18n';
import { Check } from 'lucide-react';

export default function RolesSettings({ rolesData }: { rolesData: any }) {
    if (!rolesData || !rolesData.roles) return null;

    const { roles, permissions_grouped } = rolesData;
    
    // permissions_grouped is an object { module_name: [permissions...] }
    const modules = Object.keys(permissions_grouped);

    return (
        <div className="space-y-6">
            <div className="mb-6">
                <h2 className="text-lg font-semibold">{t('Roles & Permissions')}</h2>
                <p className="text-sm text-muted-foreground">{t('Review system access levels assigned to different team roles.')}</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                        {t('Permission Matrix')}
                        <Badge variant="outline">{t('Read Only')}</Badge>
                    </CardTitle>
                    <CardDescription>
                        {t('This matrix shows what each role can access. To modify permissions, please contact system administrator support.')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto border rounded-md">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                                <tr>
                                    <th className="px-4 py-3 border-r min-w-[200px]">{t('Module / Permission')}</th>
                                    {roles.map((role: any) => (
                                        <th key={role.id} className="px-4 py-3 text-center border-r last:border-0 capitalize">
                                            {role.name.replace('_', ' ')}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {modules.map((mod) => (
                                    <tr key={mod} className="border-b bg-muted/10">
                                        <td className="px-4 py-3 font-semibold capitalize border-r" colSpan={roles.length + 1}>
                                            {mod}
                                        </td>
                                    </tr>
                                ))}
                                {modules.flatMap((mod) => 
                                    permissions_grouped[mod].map((perm: any) => (
                                        <tr key={perm.id} className="border-b last:border-0 hover:bg-muted/30">
                                            <td className="px-4 py-3 pl-8 text-muted-foreground border-r">
                                                {perm.name}
                                            </td>
                                            {roles.map((role: any) => {
                                                const hasPerm = role.permissions.some((p: any) => p.id === perm.id);
                                                return (
                                                    <td key={role.id} className="px-4 py-3 text-center border-r last:border-0">
                                                        {hasPerm && <Check className="w-4 h-4 mx-auto text-primary" />}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
