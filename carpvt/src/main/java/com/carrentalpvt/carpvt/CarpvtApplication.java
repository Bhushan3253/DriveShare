package com.carrentalpvt.carpvt;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@SpringBootApplication
@EnableScheduling
@EnableAsync
public class CarpvtApplication {

	public static void main(String[] args) {
		loadDotEnv();
		SpringApplication.run(CarpvtApplication.class, args);
	}

	/**
	 * Automatically discovers and loads key-value pairs from .env into System properties
	 * if they are not already set in the environment.
	 */
	private static void loadDotEnv() {
		String[] candidatePaths = {".env", "carpvt/.env", "../.env"};
		for (String pathStr : candidatePaths) {
			Path path = Paths.get(pathStr);
			if (Files.exists(path)) {
				try {
					List<String> lines = Files.readAllLines(path);
					for (String line : lines) {
						line = line.trim();
						if (!line.isEmpty() && !line.startsWith("#") && line.contains("=")) {
							int eqIdx = line.indexOf('=');
							String key = line.substring(0, eqIdx).trim();
							String value = line.substring(eqIdx + 1).trim();
							if (value.startsWith("\"") && value.endsWith("\"") && value.length() >= 2) {
								value = value.substring(1, value.length() - 1);
							} else if (value.startsWith("'") && value.endsWith("'") && value.length() >= 2) {
								value = value.substring(1, value.length() - 1);
							}
							if (System.getProperty(key) == null && System.getenv(key) == null) {
								System.setProperty(key, value);
							}
						}
					}
					System.out.println("Loaded environment configurations from: " + path.toAbsolutePath());
					break;
				} catch (Exception e) {
					System.err.println("Could not load .env file from " + path + ": " + e.getMessage());
				}
			}
		}
	}

}

