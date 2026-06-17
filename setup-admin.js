// One-time script to make a user an admin
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hcqmwoxgmezkpapawtqv.supabase.co';
// Use the service_role key from environment or paste below
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

async function main() {
    const email = 'mpconceptslab@gmail.com';
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Find user by email
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
        console.error('Error listing users:', listError);
        return;
    }
    
    const user = users.users.find(u => u.email === email);
    if (!user) {
        console.error('User not found:', email);
        console.log('Available users:', users.users.map(u => u.email));
        return;
    }
    
    console.log('Found user:', user.id, user.email);
    
    // Add admin role
    const { error: roleError } = await supabase
        .from('user_roles')
        .insert({ user_id: user.id, role: 'admin' });
    
    if (roleError) {
        if (roleError.message.includes('duplicate')) {
            console.log('User is already an admin!');
        } else {
            console.error('Error adding admin role:', roleError);
        }
        return;
    }
    
    console.log('Success!', email, 'is now an admin.');
    console.log('Go to /admin/ to login');
}

main().catch(console.error);
