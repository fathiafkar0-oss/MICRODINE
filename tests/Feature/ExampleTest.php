<?php

namespace Tests\Feature;

// use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic test example.
     */
    public function test_the_application_redirects_root_to_staff_login(): void
    {
        // Tidak ada halaman landing (sesuai keputusan tim) — `/` langsung
        // mengarahkan ke portal staf.
        $response = $this->get('/');

        $response->assertRedirect('/staf/masuk');
    }
}
