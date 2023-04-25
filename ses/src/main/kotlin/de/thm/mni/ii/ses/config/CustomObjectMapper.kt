package de.thm.mni.ii.ses.config

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.module.kotlin.registerKotlinModule
import javax.inject.Singleton;

@Singleton
class CustomObjectMapper {
    public fun customize(mapper: ObjectMapper): Unit {
        mapper.registerKotlinModule()
    }
}
