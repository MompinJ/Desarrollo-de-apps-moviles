plugins {
    alias(libs.plugins.android.application)
}

android {
    namespace = "com.example.ejercicio07listas"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.example.ejercicio07listas"
        minSdk = 24
        targetSdk = 35
        versionCode = 1
        versionName = "1.0"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }
}

dependencies {
    implementation(libs.appcompat)
    implementation(libs.material)
    implementation(libs.constraintlayout)
    implementation(libs.recyclerview)
}
