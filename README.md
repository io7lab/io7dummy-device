# io7 Dummy Device

This has a dummy device NodeJS program that emulates a light bulb lamp and a wall switch

Once registering two devices(say, lamp1 and switch1) to the io7 IOT Platform after the platform setup, you can run this nodejs programs without installing locally by following this step.


## To run the light bulb lamp

`npx github:io7lab/io7dummy-device lamp`
<ul>
  <li>
    First time run will let configure<br>
    <img width="431" alt="Screenshot 2024-05-27 at 4 42 50 PM" src="https://github.com/io7lab/io7dummy-device/assets/13171662/807d8eff-7b7e-4a6a-aef0-dc382dbb0b8a">
  </li>
  <li>
    Light Bulb Lamp Running<br>
    <img width="290" alt="Screenshot 2024-05-27 at 4 43 09 PM" src="https://github.com/io7lab/io7dummy-device/assets/13171662/f7f690d8-f428-4ac8-b951-4b24ce8f8269">
  </li>
</ul>



## To run the wall switch
`npx github:io7lab/io7dummy-device switch`
<ul>
  <li>
    Wall Switch Running<br>
    <img width="251" alt="Screenshot 2024-05-27 at 4 36 57 PM" src="https://github.com/io7lab/io7dummy-device/assets/13171662/f929a56b-bed3-4103-93c1-6c3deabf4653">    
  </li>
</ul>

## Example NodeRED flow 
<img width="622" alt="Screenshot 2024-05-27 at 5 02 03 PM" src="https://github.com/io7lab/io7dummy-device/assets/13171662/54bb66db-a0b0-4aed-81de-39a50246559f">

## SSL Configuration
For the SSL/TLS mqtt connection, just copy the CA's certificate file as 'ca.pem'. With 'ca.pem' file in the current directory, the device program will start mqtts connection.
