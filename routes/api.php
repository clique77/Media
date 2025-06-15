<?php
// auth
require base_path('routes/api/auth/auth.php');
require base_path('routes/api/auth/email.php');
require base_path('routes/api/auth/oauth2.php');

// social
require base_path('routes/api/social/post.php');
require base_path('routes/api/social/user.php');
require base_path('routes/api/social/message.php');
require base_path('routes/api/social/friendship.php');
require base_path('routes/api/social/chat.php');
require base_path('routes/api/social/comment.php');
require base_path('routes/api/social/report.php');
require base_path('routes/api/social/post-view.php');
require base_path('routes/api/social/tag.php');
require base_path('routes/api/social/user-block.php');
require base_path('routes/api/social/user-status.php');
require base_path('routes/api/social/like.php');
require base_path('routes/api/social/notification.php');
require base_path('routes/api/social/setting.php');

// files
require base_path('routes/api/files/private-files.php');
