<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\Auth\OAuth2Service;
use Exception;
use Illuminate\Foundation\Application;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Redirector;
use Symfony\Component\HttpFoundation\RedirectResponse;

class OAuth2Controller extends Controller
{
    public function __construct(protected OAuth2Service $oAuth2Service)
    {
    }

    /**
     * Перенаправлення на Google для авторизації.
     */
    public function redirectToGoogle(): RedirectResponse|\Illuminate\Http\RedirectResponse
    {
        return $this->oAuth2Service->redirectToGoogle();
    }

    /**
     * Callback після авторизації через Google.
     */
    public function handleGoogleCallback(): Application|\Illuminate\Http\RedirectResponse|Redirector
    {
        try {
            $tokens = $this->oAuth2Service->handleGoogleCallback();

            return redirect('/')
                ->with('success', 'Successfully authenticated with Google.')
                ->cookie('refresh_token', $tokens['refresh_token'], 20160, null, null, false, true);
        } catch (Exception $e) {
            return redirect('/')
                ->with('error', $e->getMessage());
        }
    }

    /**
     * Перенаправлення на GitHub для авторизації.
     */
    public function redirectToGitHub(): RedirectResponse|\Illuminate\Http\RedirectResponse
    {
        return $this->oAuth2Service->redirectToGitHub();
    }

    /**
     * Callback після авторизації через GitHub.
     */
    public function handleGitHubCallback(): Application|\Illuminate\Http\RedirectResponse|Redirector
    {
        try {
            $tokens = $this->oAuth2Service->handleGitHubCallback();

            return redirect('/')
                ->with('success', 'Successfully authenticated with GitHub.')
                ->cookie('refresh_token', $tokens['refresh_token'], 20160, null, null, false, true);
        } catch (Exception $e) {
            return redirect('/')
                ->with('error', $e->getMessage());
        }
    }
}
