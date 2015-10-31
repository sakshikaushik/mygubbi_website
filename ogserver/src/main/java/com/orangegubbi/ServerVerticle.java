package com.orangegubbi;

import io.vertx.core.AbstractVerticle;
import io.vertx.core.DeploymentOptions;
import io.vertx.core.Future;
import io.vertx.core.Vertx;

import java.util.HashSet;
import java.util.Set;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import com.orangegubbi.apiserver.ApiServerVerticle;
import com.orangegubbi.assetserver.AssetServerVerticle;
import com.orangegubbi.config.ConfigHolder;
import com.orangegubbi.db.DatabaseService;
import com.orangegubbi.db.QueryPrepareService;
import com.orangegubbi.db.SequenceIdGenerator;
import com.orangegubbi.support.LogServiceVerticle;
import com.orangegubbi.user.UserRegistrationHandler;

public class ServerVerticle extends AbstractVerticle
{
	private static final Logger LOG = LogManager.getLogger();
	
	public static void main(String[] args)
	{
		Vertx vertx = Vertx.vertx();
		vertx.deployVerticle(ServerVerticle.class.getCanonicalName(), new DeploymentOptions().setWorker(true), result ->
		{
			if (result.succeeded())
			{
				LOG.info("Server started.");
			}
			else
			{
				LOG.error("Server did not start. Message:" + result.result(), result.cause());
				System.exit(1);
			}
		});
	}

	@Override
	public void start(Future<Void> startFuture) throws Exception
	{
		this.startVerticle(startFuture, ConfigHolder.class);
	}

	private void startVerticle(Future<Void> startFuture, Class serviceClass)
	{
		LOG.info(serviceClass.getName() + " starting ...");
		vertx.deployVerticle(serviceClass.getCanonicalName(), result ->
		{
			if (result.succeeded())
			{
				LOG.info(serviceClass.getName() + " started.");
				if (serviceClass == DatabaseService.class)
				{
					this.startTheRest(startFuture);
				}
				else
				{
					this.startVerticle(startFuture, DatabaseService.class);
				}
			}
			else
			{
				startFuture.fail(result.cause());
			}
		});
	}

	private void startTheRest(Future<Void> startFuture)
	{
		Class[] servicesToStart = new Class[]{LogServiceVerticle.class,  
				QueryPrepareService.class,
				UserRegistrationHandler.class, SequenceIdGenerator.class,
				ApiServerVerticle.class};

		Set<String> serviceNames = new HashSet<String>();
		
		for (Class serviceClass : servicesToStart)
		{
			String serviceName = serviceClass.getCanonicalName();
			serviceNames.add(serviceName);
			LOG.info(serviceName + " starting ...");
			DeploymentOptions options = new DeploymentOptions();
			if (serviceClass == ApiServerVerticle.class)
			{
				options.setWorker(false);
			}
			else
			{
				options.setWorker(true);
			}
			vertx.deployVerticle(serviceName, options, result ->
			{
				if (result.succeeded())
				{
					LOG.info(serviceName + " started.");
					serviceNames.remove(serviceName);
				}
				else
				{
					LOG.error(serviceName + " did not start.", result.cause());
				}
			});
		}

		vertx.setTimer(10000, id -> {
			
			if (!serviceNames.isEmpty())
			{
				StringBuilder sb = new StringBuilder("Services not started:");
				for (String serviceName : serviceNames)
				{
					sb.append(serviceName).append(":");
				}
				LOG.info(sb.toString());
				startFuture.fail(sb.toString());
			}
			else
			{
				LOG.info("All services started.");
				startFuture.complete();
			}
		});		
	}

	@Override
	public void stop(Future<Void> stopFuture) throws Exception
	{
		super.stop(stopFuture);
	}
	

}